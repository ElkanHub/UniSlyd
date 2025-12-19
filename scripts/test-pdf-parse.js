try {
    const pdf = require('pdf-parse');
    console.log('SUCCESS: pdf-parse loaded successfully');
} catch (e) {
    console.error('FAILURE: pdf-parse failed to load');
    console.error(e);
}
