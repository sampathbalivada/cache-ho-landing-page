<script>
    export let footerHeight;
</script>

<footer bind:clientHeight={footerHeight}>
    <div class="footer-child">
        <div class="logo-container">
            <a href="https://cacheho.in" target="_blank">
                <img src="/images/CacheHo_Logo_Mobile.png" alt="" class="logo" />
            </a>
        </div>
        
        <div class="links-container">
            <span class="links">
                <a href="https://twitter.com/cache_ho" target="_blank">
                    <img src="/images/twitter.png" alt="twitter icon" />
                </a>
                <a href="https://instagram.com/cache_ho" target="_blank">
                    <img src="/images/instagram.png" alt="instagram icon" />
                </a>
            </span>
            <span class="links">
                <a
                    href="https://www.linkedin.com/company/cacheho"
                    target="_blank"
                >
                    <img src="/images/linkedin.png" alt="linkedin icon" />
                </a>
                <a href="mailto:cacheho.team@gmail.com" target="_blank">
                    <img src="/images/email.png" alt="email icon" />
                </a>
            </span>
        </div>
    </div>
    <div class="link-copyright">
        <p>
            Copyright © 2021 CacheHo. All Rights Reserved.
        </p>
    </div>
</footer>

<style>
    footer {
        background-color: #011130;
        border-top: 1px;
        border-bottom: 0px;
        border-left: 0px;
        border-right: 0px;
        border-color: #ffff66;
        border-style: solid;
        height: auto;
        width: 100%;
        position: fixed;
        bottom: 0;
    }

    .logo-container {
        max-width: 40%;
    }

    .logo {
        height: auto;
        max-width: 100%;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .footer-child {
        display: flex;
        justify-content: space-evenly;
        color: white;
        font-size: 12px;
    }

    .link-copyright {
        text-align: center;
        font-size: x-small;
        color: white;
    }

    .links-container {
        display: flex;
        flex-direction: column;
    }

    .links {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .links > a > img {
        padding: 15px;
        width: auto;
        height: 24px;
    }

    .link {
        font-weight: 600;
    }

    a {
        color: white;
    }

    a:hover {
        text-decoration: none;
    }
</style>
