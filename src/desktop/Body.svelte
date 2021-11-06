<script>
    let description =
        "Kudos!! You just made your day a little more productive by visiting us. Hang on buddy! Let us answer the “how” question. To answer the how question you first need to understand who we are. We are simply a group of friends who are now engineers and the thing that you are seeing on the screen right now is our idea to bring a change in the scenario of “ENGINEERING” in 2 main states that produce a lot of engineers in India namely Andhra Pradesh and Telangana. But, why are we doing this? We are just doing this to prove that Engineering is an art and not a degree by bringing in real engineering experiences, podcasts, technical blogs, and many more. I guess we answered the “how” question. There you go then! Explore our page to understand the value that we provide. Wait!! All of this is for free because we believe that learning is something that should be equally available to everyone. Lastly. Happy Engineering :)";

    let podcast_link = "https://podcast.cacheho.in";

    let blog_link = "https://blog.cacheho.in";

    let newsletter_link =
        "https://mailchi.mp/d70d6570e3ae/subscribe-to-newsletter";
</script>

<div id="content">
    <h3 id="description">
        {description}
    </h3>

    <div id="buttons-row">
        <a href={podcast_link} target="blank"> Listen to our podcast </a>

        <a href={blog_link} target="blank"> Read our blog </a>

        <a href={newsletter_link} target="blank">
            Subscribe to our newsletter
        </a>
    </div>

    <div></div>
</div>

<style>
    #description {
        color: #DFDFDF;
        font-size: 24px;
        text-align: left;
        font-weight: normal;
    }

    #content {
        max-width: 1200px;
        max-height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
    }

    #buttons-row {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    a {
        text-decoration: none;
        color: #ffff66;
        background-color: #011130;
        padding: 32px;
        border-color: #ffff66;
        border-width: 1px;
        border-style: solid;
        font-size: 20px;
    }

    a:hover {
        background-color: #ffff66;
        color: #011130;
    }
</style>
