<script lang="ts">
  import { CoNexusGame } from '@lib/story';

  export let section: string;
  export let topicName: string;

  const CoNexus: CoNexusGame = new CoNexusGame();

  const storyName: string = (
    topicName.charAt(0).toUpperCase() + topicName.slice(1)
  ).trim();

  const blankPicture = '/blank.avif';
</script>

<a class="tile" href="/{section}/{topicName}">
  {#await CoNexus.fetch_story_image(topicName!, 'tile')}
    <img
      class="tile-picture"
      loading="lazy"
      src={blankPicture}
      alt={storyName}
      draggable="false"
      height="1024"
      width="1024"
    />
  {:then storyImage}
    <img
      class="tile-picture"
      loading="lazy"
      src={storyImage ?? blankPicture}
      alt={storyName}
      draggable="false"
      height="1024"
      width="1024"
    />
  {/await}
  <p class="title">{storyName}</p>
</a>

<style>
  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 20vw;
    background-color: rgba(36, 65, 189, 0.75);
    color: rgba(255, 255, 255, 0.6);
    border: 0.1vw solid rgba(51, 226, 230, 0.5);
    border-radius: 1.5vw;
    box-shadow: 0 0 0.5vw #010020;
    cursor: pointer;
    text-decoration: none;
    flex: none;
  }

  .tile:hover,
  .tile:active {
    background-color: rgba(45, 90, 216, 0.9);
    color: rgba(51, 226, 230, 0.9);
    box-shadow: 0 0.5vw 0.5vw #010020;
    transform: scale(1.025) translateY(-0.5vw);
  }

  .tile-picture {
    object-fit: cover;
    width: 95%;
    height: 19vw;
    margin: 2.5%;
    margin-bottom: 0;
    border: 0.1vw solid rgba(51, 226, 230, 0.5);
    border-radius: 1vw;
    flex: 1;
    background-color: rgba(51, 226, 230, 0.1);
    cursor: pointer;
  }

  .title {
    text-align: center;
    padding: 1vw;
    font-size: 2vw;
    line-height: 3vw;
    text-shadow: 0 0 1vw rgba(1, 0, 32, 0.4);
    cursor: pointer;
  }

  @media only screen and (max-width: 600px) {
    .tile {
      width: 40vw;
      border-radius: 1em;
    }

    .tile-picture {
      height: 38vw;
      border-radius: 0.75em;
    }

    .title {
      font-size: 1em;
      line-height: 1.5em;
    }
  }
</style>
