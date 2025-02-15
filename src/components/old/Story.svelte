<script lang="ts">
  import { onMount } from 'svelte';

  import BackgroundMusic from '@components/music/BackgroundMusic.svelte';
  import Tts from '@components/music/Tts.svelte';
  import Step from '@components/Step.svelte';
  import { CoNexus } from '@lib/conexus';
  import type { DynTopic, ContinuableStory } from '@lib/conexus';
  import { loading, story, background_image } from '@stores/conexus';
  import { checkUserState } from '@utils/route-guard';

  import {
    showModal,
    secondButton,
    handleSecondButton,
    modalContent,
  } from '@stores/modal';
  import Share from '../Share.svelte';
  import Profile from './Profile.svelte';
  import BackArrow from '../BackArrow.svelte';

  export let story_name: string;

  onMount(async () => {
    await checkUserState('/story');
  });

  let deletedStories: string[] = []; // temp storage before reload for immediate removal
  let noUnfinishedStoriesLeft: boolean = false;
  let backgroundImageUrl: string = '/defaultBG.avif';

  background_image.subscribe((value) => {
    if (value) {
      backgroundImageUrl = value;
    }
  });

  function openModal(story: any) {
    $secondButton = `Delete story: ${
      story.category.charAt(0).toUpperCase() + story.category.slice(1)
    }`;
    $handleSecondButton = () => DeleteStory(story.story_id);
    $modalContent = `<h2>Are you sure you want to delete this story?</h2>
      <h3>This action is irreversible. You will lose all progress on this story.</h3>`;
    $showModal = true;
  }

  async function DeleteStory(story_id: any) {
    try {
      await CoNexus.delete(story_id);
      deletedStories[deletedStories.length] = story_id;
      $showModal = false;
      await CoNexus.storyContinuable(story_name!)
        .then((continuables) => {
          if (continuables.length == 0) noUnfinishedStoriesLeft = true
        })
    } catch (error) {
      console.log('Failed to delete story: ' + error);
    }
  }

  const blankPicture: string = '/blank.avif'; // temp

  // SVG Icons
  const handleDeleteSvg = (id: string, state: 'focus' | 'blur') => {
    const deleteSvgIcon = document.getElementById(`delete-icon-${id}`);
    const deleteSvgCircle = document.getElementById(`delete-circle-${id}`);
    if (state == 'focus') {
      deleteSvgIcon!.setAttribute('transform', 'scale(1.5)');
      deleteSvgCircle!.setAttribute('r', '0');
      deleteSvgCircle!.style.opacity = '0';
    } else if (state == 'blur') {
      deleteSvgIcon!.setAttribute('transform', 'scale(1)');
      deleteSvgCircle!.setAttribute('r', '90');
      deleteSvgCircle!.style.opacity = '1';
    }
  };

  const handlePlaySvg = (id: string, state: 'focus' | 'blur') => {
    const playSvgIcon = document.getElementById(`play-icon-${id}`);
    const playSvgCircle = document.getElementById(`play-circle-${id}`);
    if (state == 'focus') {
      playSvgIcon!.setAttribute('transform', 'scale(1.5)');
      playSvgCircle!.setAttribute('r', '0');
      playSvgCircle!.style.opacity = '0';
    } else if (state == 'blur') {
      playSvgIcon!.setAttribute('transform', 'scale(1)');
      playSvgCircle!.setAttribute('r', '90');
      playSvgCircle!.style.opacity = '1';
    }
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if $story === null}
  {#await CoNexus.getTopic(story_name!)}
    <header>
      <BackArrow href="./" />
      <Profile />
    </header>

    <div class="story-container blur">
      <div class="picture default-picture loading-animation"></div>

      <section class="story-info">
        <article>
          <article>
            <div class="genres" style="opacity: 0.5">
              <p>Genres:</p>
              <p class="genres-list default-genres loading-animation"></p>
            </div>
            <div class="default-line loading-animation"></div>
            <div class="default-line loading-animation"></div>
            <div class="default-line loading-animation"></div>
            <div class="default-line loading-animation last-line"></div>
          </article>
        </article>
        <div class="story-buttons-container">
          <button disabled>SHARE</button>
          <button disabled>PLAY NOW</button>
        </div>
      </section>
    </div>
  {:then topic: DynTopic}
    <header>
      <BackArrow href="./" />
      <h1 class="fade-in">
        {(topic.name.charAt(0).toUpperCase() + topic.name.slice(1)).trim()}
      </h1>
      <Profile />
    </header>

    <div class="story-container blur">
      {#await CoNexus.fetch_story_image(story_name!, 'description')}
        <div class="picture default-picture"></div>
      {:then storyImage}
        <img
          class="picture fade-in"
          src={storyImage ?? blankPicture}
          alt={topic?.name}
          draggable="false"
          width="1024"
          height="1024"
        />
      {/await}

      <section class="story-info">
        <article>
          {#if topic.genres !== ''}
            <div class="genres">
              <p>Genres:</p>
              <p class="genres-list fade-in">{topic.genres}</p>
            </div>
          {/if}
          <p class="description fade-in">{topic.description}</p>
        </article>
        <div class="story-buttons-container">
          <Share />
          <button
            on:click={() => topic && CoNexus.start(topic.name)}
            disabled={$loading}
            style={$loading ? 'color: rgb(51, 226, 230)' : ''}
          >
            {#if $loading}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                class="loading-svg"
                stroke="transparent"
                stroke-width="7.5"
                stroke-dasharray="288.5"
                stroke-linecap="round"
                fill="none"
              >
                <path
                  d="
                    M 50 96 a 46 46 0 0 1 0 -92 46 46 0 0 1 0 92
                  "
                  transform-origin="50 50"
                />
              </svg>
              Loading...
            {:else}
              PLAY NOW
            {/if}
          </button>
        </div>
      </section>
    </div>
  {:catch}
    <header>
      <a class="arrow" aria-label="Back arrow" href="./"></a>
      <Profile />
    </header>

    <div class="story-container blur">
      <div class="picture default-picture"></div>

      <section class="story-info">
        <article>
          <article>
            <div class="genres" style="opacity: 0.5">
              <p>Failed to fetch story...</p>
            </div>
            <div class="genres" style="opacity: 0.5">
              <p>Please try again or contact support.</p>
            </div>
          </article>
        </article>
        <div class="story-buttons-container">
          <button disabled>SHARE</button>
          <button disabled>ERROR</button>
        </div>
      </section>
    </div>
  {/await}

  {#await CoNexus.storyContinuable(story_name!) then continuables: ContinuableStory[]}
    {#if continuables.length > 0}
      {#if !noUnfinishedStoriesLeft}
        <section class="unfinished-stories fade-in blur">
          <h3>Continue Shaping:</h3>
          <div class="continue-shaping-container">
            {#each continuables as continuable}
              {#if !deletedStories.includes(continuable.story_id)}
                <div class="unfinished-story">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-100 -100 200 200"
                    class="delete-svg continue-shaping-btn"
                    fill="none"
                    stroke="rgb(255, 60, 64)"
                    stroke-width="15"
                    stroke-linecap="round"
                    on:click|preventDefault={() => {
                      if (!$loading) openModal(continuable);
                    }}
                    on:pointerover={() =>
                      handleDeleteSvg(continuable.story_id, 'focus')}
                    on:pointerout={() =>
                      handleDeleteSvg(continuable.story_id, 'blur')}
                    role="button"
                    tabindex="0"
                  >
                    <path
                      id="delete-icon-{continuable.story_id}"
                      d="
                        M -35 -35
                        L 35 35
                        M -35 35
                        L 35 -35
                      "
                    />
                    <circle id="delete-circle-{continuable.story_id}" r="90" />
                  </svg>
                  <h3>
                    {continuable.story_id.split('-')[0]} - {new Date(
                      continuable.created ?? '',
                    ).toLocaleDateString()}
                  </h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-100 -100 200 200"
                    class="play-svg continue-shaping-btn"
                    fill="none"
                    stroke="rgb(0, 185, 55)"
                    stroke-width="15"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    on:click|preventDefault={() => {
                      if (!$loading) CoNexus.continue(continuable);
                    }}
                    on:pointerover={() =>
                      handlePlaySvg(continuable.story_id, 'focus')}
                    on:pointerout={() =>
                      handlePlaySvg(continuable.story_id, 'blur')}
                    role="button"
                    tabindex="0"
                  >
                    <polygon
                      id="play-icon-{continuable.story_id}"
                      points="
                        -26 -36 -26 36 36 0
                      "
                      fill="rgb(0, 185, 55)"
                    />
                    <circle id="play-circle-{continuable.story_id}" r="90" />
                  </svg>
                </div>
              {/if}
            {/each}
          </div>
        </section>
      {/if}
    {/if}
  {:catch}
    <section class="unfinished-stories blur">
      <h3>Failed to fetch unfinished stories...</h3>
    </section>
  {/await}
{:else}
  <BackgroundMusic />
  <Tts />

  <Step />
{/if}

<div
  class="bg-container"
  style="
    background-image: url({backgroundImageUrl});
    "
></div>

<style>
  :global(html) {
    background-image: none;
    background-color: black;
  }

  .bg-container {
    z-index: -1000;
    position: fixed;
    top: 0;
    left: 0;
    min-width: 100vw;
    min-height: 100vh;
    background-size: cover;
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-position: center;
    opacity: 0.25;
  }

  header {
    width: 100vw;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    padding: 2vw;
    min-height: 12.5vw;
  }

  h1 {
    font-size: 5vw;
    line-height: 5vw;
    text-align: center;
    color: rgba(51, 226, 230, 0.85);
    text-shadow: 0 0.5vw 0.5vw #010020;
  }

  .arrow {
    height: 7vw;
    width: 7vw;
    z-index: 1;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex: none;
    background-image: url('/icons/backArrow.avif');
    opacity: 0.4;
    cursor: pointer;
  }

  .arrow:hover,
  .arrow:active {
    filter: drop-shadow(0 0 0.5vw rgba(51, 226, 230, 0.5));
    opacity: 0.75;
  }

  .story-container {
    max-width: 95%;
    min-width: 75%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 2vw;
    padding: 2vw;
    background-color: rgba(1, 0, 32, 0.5);
    box-shadow:
      inset 0 0 0.5vw rgba(51, 226, 230, 0.25),
      0 0 0.5vw #010020;
    border-radius: 1.5vw;
    transition: all 2s cubic-bezier(0.075, 0.82, 0.165, 1);
  }

  .story-info {
    min-height: 25vw;
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    gap: 2vw;
  }

  .picture {
    width: 25vw;
    filter: drop-shadow(0 0 0.5vw rgba(51, 226, 230, 0.25));
    border-radius: 1vw;
  }

  article {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: flex-start;
    gap: 2vw;
  }

  .genres {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 1vw;
    font-size: 1.5vw;
    line-height: 2vw;
    color: rgba(51, 226, 230, 0.75);
  }

  .genres-list {
    text-align: center;
    padding: 1vw;
    border-radius: 1vw;
    color: rgba(51, 226, 230, 0.75);
    font-size: 1.5vw;
    line-height: 2vw;
    box-shadow: inset 0 0 0.5vw rgba(51, 226, 230, 0.25);
    background-color: rgba(51, 226, 230, 0.1);
  }

  .description {
    font-size: 1.5vw;
    line-height: 3vw;
    text-shadow: 0 0.25vw 0.25vw #010020;
  }

  .story-buttons-container {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    gap: 2vw;
  }

  .unfinished-stories {
    max-width: 95%;
    background-color: rgba(51, 226, 230, 0.1);
    box-shadow:
      inset 0 0 0.5vw rgba(51, 226, 230, 0.25),
      0 0 0.5vw #010020;
    border-radius: 1.5vw;
    padding: 1vw;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    gap: 1vw;
  }

  .continue-shaping-container {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    gap: 1vw;
  }

  .unfinished-story {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    gap: 1vw;
    color: rgba(255, 255, 255, 0.5);
    background-color: rgba(36, 65, 189, 0.75);
    border: 0.05vw solid rgba(51, 226, 230, 0.5);
    box-shadow: 0 0 0.5vw #010020;
    border-radius: 1.5vw;
    padding: 0.5vw;
  }

  h3 {
    color: inherit;
  }

  .unfinished-story:hover,
  .unfinished-story:active {
    background-color: rgba(45, 90, 216, 0.9);
    color: rgba(51, 226, 230, 0.9);
    box-shadow: 0 0.5vw 0.5vw #010020;
    transform: scale(1.025) translateY(-0.25vw);
  }

  .continue-shaping-btn {
    height: 3vw !important;
  }

  .story-buttons-container button {
    gap: 1vw;
  }

  .loading-svg {
    height: 1.5vw;
    width: 1.5vw;
  }

  /* LOADING */

  .default-picture {
    min-width: 25vw;
    height: 25vw;
    filter: none;
    background-color: rgba(51, 226, 230, 0.1);
  }

  .default-genres {
    min-width: 35vw;
    color: transparent;
    text-shadow: none !important;
    height: 4vw;
    background-color: rgba(51, 226, 230, 0.2);
  }

  .default-line {
    background-color: rgba(51, 226, 230, 0.1);
    height: 1.5vw;
    width: 44vw;
    margin-block: -0.5vw;
  }

  .last-line {
    width: 25vw;
  }

  @media only screen and (max-width: 600px) {
    :global(html) {
      padding-top: 0;
    }

    .story-info {
      width: auto;
    }

    .story-buttons-container button {
      gap: 0.5em;
    }

    header {
      position: fixed;
      top: 0;
      background-color: rgba(1, 0, 32, 0.75);
      box-shadow: 0 0.5vw 0.5vw #010020;
      -webkit-backdrop-filter: blur(2vw);
      backdrop-filter: blur(2vw);
      z-index: 2;
      min-height: 5em;
    }

    h1 {
      font-size: 1.5em;
    }

    .arrow {
      width: 3em;
      height: 3em;
    }

    .story-container {
      margin-top: 25%;
      max-width: 100%;
      flex-direction: column;
      gap: 1.5em;
      padding-top: 1.5em;
      border-radius: 0;
      border-left: none;
      border-right: none;
    }

    .picture {
      width: 90vw;
      border-radius: 0.5em;
    }

    article {
      flex-direction: column-reverse;
      min-height: none;
      align-items: center;
    }

    .genres {
      flex-direction: column;
      gap: 0.25em;
      font-size: 1.2em;
      line-height: 2em;
      width: 90vw;
    }

    .genres-list {
      padding: 0.5em;
      font-size: 1em;
      line-height: 1.5em;
      text-shadow: 0 0 0.1em #010020;
      border-radius: 0.5em;
    }

    .default-genres {
      width: 80vw;
    }

    .description {
      text-align: center;
      font-size: 1em;
      line-height: 2em;
      width: 90vw;
    }

    .story-buttons-container {
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

    .unfinished-stories {
      max-width: 100%;
      border-radius: 0;
      border-left: none;
      border-right: none;
      padding: 1em;
      gap: 1em;
    }

    .continue-shaping-container {
      gap: 1em;
    }

    .unfinished-story {
      gap: 1em;
      padding: 0.25em;
      width: 90vw;
      justify-content: space-between;
      border-radius: 1em;
    }

    .continue-shaping-btn {
      height: 2em !important;
    }

    .default-picture {
      height: 90vw;
    }

    .default-genres {
      min-width: none;
      width: 80vw;
      height: 2.5em;
    }

    .default-line {
      height: 1em;
      width: 80vw;
      margin-block: 0.25em;
    }

    .last-line {
      width: 80vw;
    }

    .loading-svg {
      height: 1em;
      width: 1em;
    }
  }
</style>
