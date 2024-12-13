// tests/controllers/user.controller.test.ts
import request from 'supertest';
import app from '../../src/index'; // Asegúrate de exportar tu app en index.ts

let server: any;

beforeAll((done) => {
  server = app.listen(3001, () => {
    console.log('Test server running on port 3001');
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe('User Controller', () => {
  it('should create a new user', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        nombre: 'Test User',
        email: 'testuser3@example.com',
        password: 'password123',
        telefono: '1234567890',
        rol: 'cliente'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.email).toBe('testuser3@example.com');
  });

  it('should not create a user with an existing email', async () => {
    const response = await request(server)
      .post('/api/auth/register')
      .send({
        nombre: 'Test User',
        email: 'testuser3@example.com',
        password: 'password123',
        telefono: '1234567890',
        rol: 'cliente'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('El correo electrónico ya está en uso');
  });
});
