<script lang="ts">
	import {ProjectRepository} from "./projectRepository"

	const projectName = location.search.substring("?project=".length)
	const project = new ProjectRepository({projectName, projectKey: "test"})
</script>

<main>
	<h1>Hello !</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>