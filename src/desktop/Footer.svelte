<script>
    export let footerHeight;
</script>

<footer bind:clientHeight={footerHeight}>
    <div class="footer">
        <a href="https://cacheho.in" target="_blank">
            <img src="/images/CacheHo_Logo.png" alt="" />
        </a>
        <div class="link-copyright">
            <a href="https://cacheho.in" target="_blank"
                ><p class="link">CACHEHO.IN</p>
            </a>
            <p class="copyright">
                Copyright © 2021 CacheHo. All Rights Reserved.
            </p>
        </div>
        <span class="links">
            <a href="https://instagram.com/cache_ho" target="_blank">
                <img src="/images/instagram.png" alt="instagram icon" />
            </a>
            <a href="https://twitter.com/cache_ho" target="_blank">
                <img src="/images/twitter.png" alt="twitter icon" />
            </a>
            <a href="https://www.linkedin.com/company/cacheho" target="_blank">
                <img src="/images/linkedin.png" alt="linkedin icon" />
            </a>
            <a href="mailto:cacheho.team@gmail.com" target="_blank">
                <img src="/images/email.png" alt="email icon" />
            </a>
        </span>
    </div>
</footer>

<style>
    footer {
        border-top: 1px;
        border-bottom: 0px;
        border-left: 0px;
        border-right: 0px;
        border-color: #ffff66;
        border-style: solid;
        height: auto;
        width: 100%;
        
        /* position: fixed;
        bottom: 0; */
    }

    img {
        height: 75px;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .footer {
        display: flex;
        justify-content: space-evenly;
        color: white;
        font-size: 12px;
    }

    .link-copyright {
        text-align: center;
        display: flex;
        justify-content: center;
        align-content: center;
        flex-direction: column;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .links {
        display: flex;
        justify-content: space-around;
        align-items: center;
    }

    .links > a > img {
        padding: 20px;
        width: auto;
        height: 28px;
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
