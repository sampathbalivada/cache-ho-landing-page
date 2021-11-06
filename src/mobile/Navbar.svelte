<script>
    export let headerHeight;
</script>

<header bind:clientHeight={headerHeight}>
    <img src="/logo.png" alt="" />
</header>

<style>
    img {
        height: auto;
        width: 100%;
        text-align: center;
    }
</style>
