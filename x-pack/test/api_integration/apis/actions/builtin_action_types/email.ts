/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import expect from '@kbn/expect';

import { KibanaFunctionalTestDefaultProviders } from '../../../../types/providers';

// eslint-disable-next-line import/no-default-export
export default function emailTest({ getService }: KibanaFunctionalTestDefaultProviders) {
  const supertest = getService('supertest');
  const esArchiver = getService('esArchiver');

  describe('create email action', () => {
    after(() => esArchiver.unload('empty_kibana'));

    let createdActionId = '';

    it('should return 200 when creating an email action successfully', async () => {
      const { body: createdAction } = await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          attributes: {
            description: 'An email action',
            actionTypeId: '.email',
            actionTypeConfig: {
              service: '__json',
              user: 'bob',
              password: 'supersecret',
              from: 'bob@example.com',
            },
          },
        })
        .expect(200);

      createdActionId = createdAction.id;
      expect(createdAction).to.eql({
        id: createdActionId,
      });

      expect(typeof createdActionId).to.be('string');

      const { body: fetchedAction } = await supertest
        .get(`/api/action/${createdActionId}`)
        .expect(200);

      expect(fetchedAction).to.eql({
        type: 'action',
        id: fetchedAction.id,
        attributes: {
          description: 'An email action',
          actionTypeId: '.email',
          actionTypeConfig: {
            from: 'bob@example.com',
            service: '__json',
            host: null,
            port: null,
            secure: null,
          },
        },
        references: [],
        updated_at: fetchedAction.updated_at,
        version: fetchedAction.version,
      });
    });

    it('should return the message data when firing the __json service', async () => {
      await supertest
        .post(`/api/action/${createdActionId}/_fire`)
        .set('kbn-xsrf', 'foo')
        .send({
          params: {
            to: ['kibana-action-test@elastic.co'],
            subject: 'email-subject',
            message: 'email-message',
          },
        })
        .expect(200)
        .then((resp: any) => {
          expect(resp.body.data.message.messageId).to.be.a('string');
          expect(resp.body.data.messageId).to.be.a('string');

          delete resp.body.data.message.messageId;
          delete resp.body.data.messageId;

          expect(resp.body.data).to.eql({
            envelope: {
              from: 'bob@example.com',
              to: ['kibana-action-test@elastic.co'],
            },
            message: {
              from: { address: 'bob@example.com', name: '' },
              to: [
                {
                  address: 'kibana-action-test@elastic.co',
                  name: '',
                },
              ],
              cc: null,
              bcc: null,
              subject: 'email-subject',
              html: '<p>email-message</p>\n',
              text: 'email-message',
              headers: {},
            },
          });
        });
    });

    it('should render html from markdown', async () => {
      await supertest
        .post(`/api/action/${createdActionId}/_fire`)
        .set('kbn-xsrf', 'foo')
        .send({
          params: {
            to: ['kibana-action-test@elastic.co'],
            subject: 'message with markdown',
            message: '_italic_ **bold** https://elastic.co link',
          },
        })
        .expect(200)
        .then((resp: any) => {
          const { text, html } = resp.body.data.message;
          expect(text).to.eql('_italic_ **bold** https://elastic.co link');
          expect(html).to.eql(
            '<p><em>italic</em> <strong>bold</strong> <a href="https://elastic.co">https://elastic.co</a> link</p>\n'
          );
        });
    });

    it('should respond with a 400 Bad Request when creating an email action with an invalid config', async () => {
      await supertest
        .post('/api/action')
        .set('kbn-xsrf', 'foo')
        .send({
          attributes: {
            description: 'An email action',
            actionTypeId: '.email',
            actionTypeConfig: {},
          },
        })
        .expect(400)
        .then((resp: any) => {
          expect(resp.body).to.eql({
            statusCode: 400,
            error: 'Bad Request',
            message:
              'The actionTypeConfig is invalid: [user]: expected value of type [string] but got [undefined]',
          });
        });
    });
  });
}
