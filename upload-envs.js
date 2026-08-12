import { execSync } from 'child_process';
import fs from 'fs';

const addEnv = (name, value) => {
    try {
        console.log(`Removing existing ${name} (if any)...`);
        try {
             execSync(`npx vercel env rm ${name} production -y`, { stdio: 'ignore' });
        } catch (e) {
             // Ignore error if it doesn't exist
        }
        console.log(`Adding ${name}...`);
        execSync(`npx vercel env add ${name} production`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
    } catch (e) {
        console.log(`Error adding ${name}:`, e.message);
    }
}

// Frontend Variables
addEnv('VITE_FIREBASE_API_KEY', 'AIzaSyB3WYQPfnpi70lk81fKZzQF2ZeAEhUMCKQ');
addEnv('VITE_FIREBASE_AUTH_DOMAIN', 'hassan-s-goat-farm.firebaseapp.com');
addEnv('VITE_FIREBASE_PROJECT_ID', 'hassan-s-goat-farm');
addEnv('VITE_FIREBASE_STORAGE_BUCKET', 'hassan-s-goat-farm.firebasestorage.app');
addEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '876458491408');
addEnv('VITE_FIREBASE_APP_ID', '1:876458491408:web:3caf160115abf71a4b5495');

// Backend Variables
addEnv('FIREBASE_PROJECT_ID', 'hassan-s-goat-farm');
addEnv('FIREBASE_CLIENT_EMAIL', 'firebase-adminsdk-fbsvc@hassan-s-goat-farm.iam.gserviceaccount.com');
addEnv('FIREBASE_PRIVATE_KEY', `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCp0KKWValWSUcb\nLSTicqz8DseobaJSZTy4Yct3uMj02YtjFDcExRvV5B9cad4xPfjrKF07ZR9Ay99d\nVrbC+lj6T+IFyNiMGycTZrsOGR74maESVeg0XQGs9eSg+Y0aqJMPqgUzhCiTzca7\nQRcX0V5kPHBzkgxvSrMX1dLq7xfvcD25dLOd2VQTcNSvg+evpVtfBoRCln8+74ct\n9oIp3PRNcRP9Oxs/LdNFLxzjUIXKcS7sLcCX7L+WFH9owd9IM++hOkXos/fAhVhJ\nrkFHG9ejTVEkTYWh2UM2eNhnGleWbFPXI64Q0irM/+KkODGBaTK7QAut3yUhu2Xo\nm8YHLhm1AgMBAAECggEAAnzoMjv9YqJpNHM5Xp31KIOOQPVLkwR2WscyrsWEyt2N\nvBJgP1Ako8IXWYhtinAmKkp+7y9V7Azwmqf6E9TiIoIIGt3smkTi54GyTOG+VpW9\nn+H6qHBnurZ8NoWMH9oHaYvWpAC+2BzZhAXPRk3kIaN8YZ0VVI4WHfZyhCGjn/eR\nZejTFZn2IrjoqUuJxEsyMo/SBlAQ1aNST7LGaGTaDDHAxVpWE38N+mBBEF4BEG39\nNXJG6xnAK5fYD4nisein5mdOLDFXvQQznK/+f9+JgkXVacN9xQLq6nwiHA6JAl0J\nbEcK0TQavFg00Z0QUuqNmZ8omaQlI4JgyqI51TZvAQKBgQDWrspOm0hkKTKw4NMv\nx0MOWwy7dK9hhOKLN1Si7kq/7VlFWOrM8EP+4C4z9dLs/J5+6b4efYXlXhXAOC2c\nRROP5A4yuTxD6AiSpynsyNGUP4Fv3DLke+/gJPbY2BO6ddVUu3R/mCZqiwLKvHT5\nGy/9Me/juvol++g8behAM+UAgQKBgQDKf0CuZRH2cVGLmgYnWv8IEeEwFY4dUSNw\nNGBYDjiL/gekOJIL9uTQrixikCfDb7x6CT0Zq6ow0rhRavu8sLxxOy81qzhD5xQi\nOeJxDpxejAJas4h33ZuNns2xeiV6zgOcxlSjfyKXTPrfV0kf9uXXas4TNK8yspiP\nA5suKwV/NQKBgQC+0nzWpCYTiZ8aI6z0Ag0znHDTyuL9Lo3jqtnbPS5KLOG1x1Rl\nt4bo7UGERBQpPF5xdrjcBzzV5Ow2gHjiN3As7UxFf+r2fS/pkxar9tB7Enut/y9p\nclSEirazhlT63zQxbbIenBJBj7B6nkrnBWiBiTqu1Ir26lPCKvtO3hHGgQKBgFv/\nABW62TRLOy7fJNiQYLj71oCP6marTBxXz0VyAIKpQDN9d+xzmHSuDIAi2c3SX6BZ\nviaBdOqFcTOcFQ4ehR40MziAtykyPFVoUtXmO2hA13j5g5BhX6Axe2WcBpcKLV32\nRNGams5+LKN29kPNWZJKdaEIGGhB90lR7BhHd1HZAoGBAJhk+KrAnn0fVATPt492\nyLpI+RHwISTCEHLQEPPC+ctZPFq9JhsCJ0qureUl9RpRWHBDgiqdRtymKEzOv8KJ\nz/aWiRAydvIBu3orAXnzWDuTU3wjwQtVjdpwzeBpU6VSpT0PdV/KjXuGuzdGCh/n\nkjixlBLH1MlM2XGtwZHREYbq\n-----END PRIVATE KEY-----\n`);
addEnv('FIREBASE_DATABASE_URL', 'https://hassan-s-goat-farm-default-rtdb.firebaseio.com');

console.log("All variables have been set!");
