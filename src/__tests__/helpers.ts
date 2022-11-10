import {givenHttpServerConfig} from '@loopback/testlab';
import {StreamingServiceApplication} from '../application';
import {User} from '../models';

export function givenUser(user?: Partial<User>) {
  const data = Object.assign(
    {
      email: 'test@example.com',
      password: 'qwerty123',
      firstName: 'test',
      lastName: 'doe',
      permissions: ['user'],
    },
    user,
  );
  return new User(data);
}

export function givenRootAdmin(user?: Partial<User>) {
  const data = Object.assign(
    {
      email: 'root@example.com',
      password: 'qwerty123',
      firstName: 'root',
      lastName: 'administrator',
      permissions: ['user'],
    },
    user,
  );
  return new User(data);
}

export function givenUserWithoutId(todo?: Partial<User>): Omit<User, 'id'> {
  return givenUser(todo);
}

export async function givenRunningApplicationWithCustomConfiguration() {
  const app = new StreamingServiceApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();

  /**
   * Override default config for DataSource for testing so we don't write
   * test data to file when using the memory connector.
   */
  app.bind('datasources.config.db').to({
    name: 'db',
    connector: 'memory',
  });

  // Start Application
  await app.start();
  return app;
}
