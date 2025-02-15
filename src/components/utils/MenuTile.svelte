<script lang="ts">
  import { web3LoggedIn } from '@stores/account';

  export let section: Section;

  let isWeb3LoggedIn: boolean = false;

  web3LoggedIn.subscribe((value) => {
    isWeb3LoggedIn = value;
  });

  // sectionImage is the name of the section but remove the spaces
  const imageName: string = section.name.replace(/\s/g, '');

  const sectionImage: string = `https://media.degenerousdao.com/conexus-sections/${imageName.toLocaleLowerCase()}.avif`;

  const blankPicture: string = '/blank.avif'; // temp
</script>

<a class="tile" id={section.name} href="/{section.name}">
  <img
    class="tile-picture"
    src={sectionImage ?? blankPicture}
    alt={section.name}
    width="1024"
    height="1024"
    draggable="false"
  />
  <p class="title">{section.name}</p>
</a>

<style>
  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 28vw;
    background-color: rgba(22, 30, 95, 0.75);
    color: rgba(51, 226, 230, 0.75);
    border-radius: 2.5vw;
    box-shadow:
      inset 0 0 0.5vw rgba(51, 226, 230, 0.25),
      0 0 0.5vw #010020;
    cursor: pointer;
    text-decoration: none;
  }

  .tile:hover,
  .tile:active {
    background-color: rgba(51, 226, 230, 0.5);
    color: #010020;
    box-shadow:
      inset 0 0 0.5vw #010020,
      0 0.5vw 0.5vw #010020;
    transform: scale(1.025) translateY(-0.5vw);
  }

  .tile-picture {
    object-fit: cover;
    width: 92%;
    height: 80%;
    margin: 4%;
    margin-bottom: 0;
    box-shadow: 0 0 0.5vw rgba(51, 226, 230, 0.25);
    border-radius: 2vw;
    background-color: rgba(51, 226, 230, 0.1);
    cursor: pointer;
  }

  .title {
    font-size: 2vw;
    line-height: 3vw;
    padding-block: 1vw;
    white-space: nowrap;
    text-shadow: 0 0 0.1vw #010020;
    cursor: pointer;
  }

  @media only screen and (max-width: 600px) {
    .tile {
      width: 85vw;
      border-radius: 1em;
    }

    .tile-picture {
      width: 95%;
      margin: 3%;
      margin-bottom: 0;
      border-radius: 0.5em;
    }

    .title {
      font-size: 1.25em;
      line-height: 2.25em;
      padding-block: 0.25em;
    }
  }
</style>
