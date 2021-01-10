<script lang="ts">
  import { ProjectRepository } from "./projectRepository"
  //import * as wasm from "album-wasm"

  const projectName = location.search.substring("?project=".length)
  const project = new ProjectRepository({ projectName, projectKey: "test" })
  const initialImagesPromise = project.getAllImages()

  function loadFile(event) {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target.result as string
      project.addImage(result)
    }
    reader.readAsDataURL(file)
  }
</script>

<main>
  {#await initialImagesPromise}
    <p>...waiting</p>
  {:then initialImages}
    <input type="file" on:change={loadFile}/>

    <div>
      {#each initialImages as image}
        <img src={image} alt="image"/>
      {/each}
    </div>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>