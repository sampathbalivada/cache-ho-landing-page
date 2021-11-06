var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/sampathbalivada/cache-ho-landing-page.git', // Update to point to your repository  
        user: {
            name: 'sampathbalivada', // update to use your name
            email: 'balivadask2000@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)