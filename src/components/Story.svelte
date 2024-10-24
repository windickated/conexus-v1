<script lang="ts">
  import { writable } from 'svelte/store';

  import BackgroundMusic from '@components/music/BackgroundMusic.svelte';
  import Tts from '@components/music/Tts.svelte';
  import Step from '@components/Step.svelte';
  import { CoNexus } from '@lib/conexus';
  import type { DynTopic, ContinuableStory } from '@lib/conexus';
  import { loading, story } from '@stores/conexus';

  import Modal from './Modal.svelte';

  export let topic: DynTopic | null;
  export let continuables: ContinuableStory[] = [];

  let showDeleteModal = writable<boolean>(false);
  let selectedStory: any;

  function openModal(story: any) {
    selectedStory = story;
    showDeleteModal.set(true);
  }

  function DeleteStory(story_id: any) {
    CoNexus.delete(story_id);
    showDeleteModal.set(false);
  }

  const tempDescription: string =
    'Play as a prisoner going through experiments in a guarded prison and try to escape the planet by defeating or fleeing from The Warden.';
  const longTempDescription: string = `In the heart of the vast azure ocean lies the Enchanted Private Island, a hidden paradise ruled by the majestic Lazy Lions, who possess wisdom and regal grace. This utopia, with its lush landscapes and ancient secrets, faces a dire threat from Glitch, a former lion of the pride who seeks to conquer the island. As Glitch gathers his ruthless generals, the peaceful Lazy Lions must defend their home, not with violence, but by uncovering the island's forgotten mysteries. Embarking on a journey of bravery and discovery, they strive to protect the island's soul and preserve the harmony that defines their enchanted sanctuary.`;
  const tempImage: string = '/descriptionPicture/DischordianSaga/Escape.avif';
  const squareTempImage: string = '/descriptionPicture/Collabs/GLMRApes.avif';
</script>

{#if $story === null}
  {#if topic !== null}
    <h1 class="title">
      {topic.name.charAt(0).toUpperCase() + topic.name.slice(1)}
    </h1>

    <div class="story-info blur">
      <!-- <img class="picture" src={topic.descriptionPicture} alt={topic?.name} draggable="false" /> -->
      <img
        class="picture"
        src={tempImage}
        alt={topic?.name}
        draggable="false"
        width="1024"
        height="1024"
      />

      <p class="description">{topic.description}</p>
      
      {#if topic.genres !== ''}
        <p class="description">
          Genres: {topic.genres}
        </p>
      {/if}
    </div>


    <div class="buttons-container">
      <button class="blur" on:click={() => window.history.back()}>
        QUIT
      </button>
      <button class="blur" on:click={() => CoNexus.start(topic.name)}>
        PLAY NOW
      </button>
    </div>

    <section class="unfinished-stories blur">
      <p class="continue-shaping-label">Continue shaping:</p>
      <form class="continue-shaping-container">
        {#each continuables as continuable}
          <div class="unfinished-story">
            <button
              aria-label="Delete story"
              class="continue-shaping-btn delete-button"
              on:click|preventDefault={() => openModal(continuable)}
              disabled={$loading}
            ></button>
            <p>
              {continuable.category} - {continuable.story_id.split('-')[0]}
            </p>
            <button
              aria-label="Continue shaping"
              class="continue-shaping-btn continue-button"
              on:click|preventDefault={() => CoNexus.continue(continuable)}
              disabled={$loading}
            ></button>
          </div>
        {/each}
      </form>
    </section>

    <!-- Delete Story Modal -->

    {#if selectedStory}
    <Modal bind:showModal={$showDeleteModal}>
      <h2 class="modal-text">
        Are you sure you want to delete this story?
      </h2>
      <hr />
      <p class="modal-text">
        This action is irreversible. You will lose all progress on this
        story.
      </p>
      <button
        class="modal-delete"
        on:click={() => DeleteStory(selectedStory.story_id)}
        >Delete story: {selectedStory.category}</button
      >
    </Modal>
  {/if}
  {:else}
    <p class="error-message">Something went wrong...</p>
  {/if}
{:else}
  <BackgroundMusic />
  <Tts />

  <Step />
{/if}

<style>
  .title {
    font-size: 5vw;
    line-height: 5vw;
    text-align: center;
    margin: 3vw auto;
    color: rgba(51, 226, 230, 0.85);
    -webkit-text-stroke: 0.03vw #33e2e6;
    filter: drop-shadow(0 0 1vw rgba(51, 226, 230, 0.5));
  }

  .story-info {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    gap: 2vw;
    padding: 2vw;
    margin-inline: 5vw;
    background-color: rgba(1, 0, 32, 0.5);
    border: 0.05vw solid rgba(51, 226, 230, 0.5);
    border-radius: 2.5vw;
  }

  .picture {
    width: 30vw;
    filter: drop-shadow(0 0 0.5vw rgba(51, 226, 230, 0.25));
    border-radius: 1.5vw;
  }

  .description {
    text-align: center;
    font-size: 1.5vw;
    line-height: 3vw;
    text-shadow: 0 0 0.5vw rgb(1, 0, 32);
    margin-block: 2vw;
  }

  .buttons-container {
    width: 85vw;
    margin: 2vw auto;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  button {
    width: 25vw;
    padding: 1vw 2vw;
    font-size: 2vw;
    color: rgba(255, 255, 255, 0.6);
    background-color: rgba(36, 65, 189, 0.75);
    border: 0.05vw solid rgba(51, 226, 230, 0.5);
    border-radius: 1.5vw;
    transition: all 0.15s ease-out;
  }

  button:hover,
  button:active {
    text-shadow: 0 0 1vw rgba(1, 0, 32, 0.75);
    background-color: rgba(45, 90, 216, 0.9);
    color: rgb(51, 226, 230);
    border: 0.05vw solid rgb(51, 226, 230);
    transform: matrix(1.05, 0, 0, 1.05, 0, 0);
    filter: drop-shadow(0 0 1vw rgba(51, 226, 230, 0.5));
  }

  .error-message {
    text-align: center;
    font-size: 2vw;
    line-height: 2vw;
    color: rgba(51, 226, 230, 0.5);
    padding-block: 2vw;
  }

  .unfinished-stories {
    max-width: 90vw;
    margin-inline: auto;
    background-color: rgba(51, 226, 230, 0.1);
    border: 0.05vw solid rgba(51, 226, 230, 0.5);
    border-radius: 2.5vw;
    padding: 1vw;
  }

  .continue-shaping-container {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    gap: 1vw;
  }

  .continue-shaping-label {
    color: rgba(51, 226, 230, 0.75);
    font-size: 2vw;
    text-align: center;
    padding-bottom: 1vw;
  }

  .unfinished-story {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 1vw;
    color: rgba(255, 255, 255, 0.6);
    background-color: rgba(36, 65, 189, 0.75);
    border: 0.05vw solid rgba(51, 226, 230, 0.75);
    border-radius: 1.5vw;
    padding: 0.5vw;
  }

  .unfinished-story:hover,
  .unfinished-story:active {
    background-color: rgba(45, 90, 216, 0.9);
    color: rgba(51, 226, 230, 0.9);
    filter: drop-shadow(0 0 0.5vw rgba(51, 226, 230, 0.25));
    transform: scale(1.01);
    transition: transform 0.15s ease-in-out;
  }

  .unfinished-story p {
    text-align: center;
    white-space: nowrap;
    font-size: 1.5vw;
    line-height: 1.5em;
    cursor: default;
  }

  .continue-shaping-btn {
    padding: 0;
    margin: 0;
    border: none !important;
    border-radius: 0;
    background-color: rgba(0, 0, 0, 0);
    opacity: 0.75;
    width: 3vw;
    height: 3vw;
    background-size: contain;
    background-repeat: no-repeat;
  }

  .continue-shaping-btn:hover,
  .continue-shaping-btn:active{
    background-color: rgba(0, 0, 0, 0);
    color: rgba(0, 0, 0, 0);
    opacity: 1;
  }

  .delete-button {
    background-image: url('/icons/delete.png');
  }

  .continue-button {
    background-image: url('/icons/play.png');
  }

  hr {
    border: 0.05vw solid rgba(51, 226, 230, 0.5);
    width: 90%;
  }

  .modal-text {
    font-size: 2vw;
    line-height: 3vw;
    text-align: center;
    padding-block: 1vw;
  }

  .modal-delete {
    width: 70%;
    margin-inline: 15%;
    margin-block: 1vw;
    padding-inline: 2vw;
    border: 0.05vw solid rgba(51, 226, 230, 0.75);
    border-radius: 2vw;
    font-size: 2.5vw;
    line-height: 4vw;
    color: rgba(51, 226, 230, 0.75);
    background-color: rgba(51, 226, 230, 0.1);
    filter: drop-shadow(0 0 0.1vw rgba(51, 226, 230, 0.4));
  }

  .modal-delete:hover,
  .modal-delete:active {
    color: rgba(51, 226, 230, 1);
    background-color: rgba(51, 226, 230, 0.5);
    filter: drop-shadow(0 0 1vw rgba(51, 226, 230, 0.4));
  }

  @media only screen and (max-width: 600px) {
    :global(html) {
      padding-block: 0 5em;
    }

    .title {
      font-size: 2em;
      line-height: 3em;
      margin: 0.25em auto;
    }

    .story-info {
      flex-direction: column;
      margin: 0;
      padding-block: 1.5em;
      gap: 1.5em;
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    .picture {
      width: 90vw;
      filter: drop-shadow(0 0 0.5em rgba(51, 226, 230, 0.25));
    }

    .description {
      font-size: 1em;
      line-height: 2em;
      width: 90vw;
    }

    .buttons-container {
      width: 100vw;
      flex-direction: column-reverse;
      align-items: center;
      gap: 1.5em;
      margin-block: 1.5em;
    }

    button {
      width: 80vw;
      font-size: 1.5em;
      line-height: 1.5em;
      padding: 0.25em 0.5em;
    }

    .error-message {
      font-size: 1em;
      line-height: 1em;
    }

    .unfinished-stories {
      max-width: none;
      width: 100vw;
      border-radius: 0;
      border-left: none;
      border-right: none;
      padding: 1em;
    }

    .continue-shaping-label {
      font-size: 1.5em;
      line-height: 2em;
      padding-bottom: 1em;
    }

    .continue-shaping-container {
      gap: 1em;
    }

    .unfinished-story {
      gap: 1em;
      padding: 0.25em;
      width: 90vw;
      justify-content: space-between;
    }

    .unfinished-story p {
      font-size: 1em;
      line-height: 1.5em;
      white-space: wrap;
    }

    .continue-shaping-btn {
      width: 2em;
      height: 2em;
    }

    .modal-text {
      font-size: 1em;
      line-height: 1.5em;
      padding: 0.5em;
    }

    .modal-delete {
      width: 90%;
      margin-inline: 5%;
      font-size: 1.2em;
      line-height: 2em;
      margin-block: 1em 0;
    }
  }
</style>
