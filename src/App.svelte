<script>
	import MediaQuery from "./MediaQuery.svelte";

	import Navbar from "./desktop/Navbar.svelte";
	import Footer from "./desktop/Footer.svelte";
	import Description from "./desktop/Description.svelte";
	import Buttons from "./desktop/Buttons.svelte";

	import MobileNavbar from "./mobile/Navbar.svelte";
	import MobileFooter from "./mobile/Footer.svelte";
	import MobileButtons from "./mobile/Buttons.svelte";
</script>

<MediaQuery query="(min-width: 481px)" let:matches>
	{#if matches}
		<div>
			<Navbar />
			<Description />
			<Buttons />
			<div class="fill"></div>
			<Footer />
		</div>
	{/if}
</MediaQuery>

<MediaQuery query="(max-width: 480px)" let:matches>
	{#if matches}
		<MobileNavbar/>
		<Description/>
		<!-- <Buttons/> -->
		<MobileButtons/>
		<MobileFooter/>
	{/if}
</MediaQuery>

<style>
	div {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		height: 100%;
	}

	.fill {
		padding-bottom: 20px;
	}
</style>
