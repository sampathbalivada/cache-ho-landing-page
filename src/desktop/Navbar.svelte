<script>
    export let headerHeight;
</script>

<header bind:clientHeight={headerHeight}>
    <img src="./logo.png" alt="">
</header>

<style>
    header {
        height: auto;
        width: 100%;
        text-align: center;
    }

    img {
        height: auto;
        width: 35%;
    }
</style>
