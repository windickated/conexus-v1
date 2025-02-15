<script lang="ts">
  import { onMount } from 'svelte';
  import {
    CoNexusApp
  } from '@libv2/view';
  import { checkUserState, checkWeb3LoginState } from '@utils/route-guard';
  import { web3LoggedIn } from '@stores/account';
  import StoryCollection from './utils/StoryCollection.svelte';
  import Links from './utils/Links.svelte';

  export let section: string;
  let isWeb3LoggedIn: boolean = false;

  let app: CoNexusApp = new CoNexusApp();

  let categories: SectionCategory[] = [];
  let genres: { id: number; name: string }[] = [];

  onMount(async () => {
    await checkUserState(`/${section}`);
    web3LoggedIn.subscribe((value) => {
      isWeb3LoggedIn = value;
    });
    checkWeb3LoginState(isWeb3LoggedIn, section);

    try {
      categories = await app.getSectionCategories(section);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
    try {
      genres = await app.getGenres();
    } catch (error) {
      console.error('Failed to fetch genres:', error);
    }
  });

  // Search and Sorting
  let filteredCategories: SectionCategory[];
  let isSorting: boolean = false;
  let sortedCategories: SectionCategory[] = [];
  let searchField: string;
  let isSearching: boolean = false;
  let debounceTimeout: NodeJS.Timeout;

  $: filteredCategories = categories;

  const handleSearch = async () => {
    clearTimeout(debounceTimeout);
    if (!searchField) {
      filteredCategories = categories;
      isSearching = false;
      return;
    }
    resetGenres();
    isSearching = true; // Set isSearching to true when the debounce starts
    debounceTimeout = setTimeout(async () => {
      filteredCategories = await app.searchSectionCategories(
        searchField.replace(/[^a-zA-Z ]/g, ''),
        section,
      );
      isSearching = false; // Stop searching after results are returned
      if (isSorting) handleSorting();
    }, 3750); // 3.75-second debounce delay
  };

  let searchInput: HTMLInputElement | null;
  let searchFocus = false;
  const handleSearchFocus = () => {
    if (!searchInput) return;
    if (!searchFocus) {
      searchInput.focus();
      searchFocus = false;
    }
    if (searchFocus) {
      searchInput.blur();
      searchFocus = true;
    }
  };

  const handleSorting = () => {
    sortedCategories = filteredCategories.map((cat: SectionCategory) => {
      // Clone the category and topics to avoid mutating the original
      return {
        ...cat,
        topics: [...cat.topics].sort((a, b) => {
          const firstTopic = (
            a.name.charAt(0).toUpperCase() + a.name.slice(1)
          ).trim();
          const secondTopic = (
            b.name.charAt(0).toUpperCase() + b.name.slice(1)
          ).trim();
          // Sorting all topics in the category alphabetically
          if (firstTopic < secondTopic) return -1;
          if (firstTopic > secondTopic) return 1;
          return 0;
        }),
      };
    });
    filteredCategories = sortedCategories;
  };

  // Genres
  let activeGenre: string;
  $: getGenre(activeGenre);

  async function getGenre(genre: string) {
    if (!genre) return;
    if (searchField) {
      searchField = '';
      handleSearch();
    }
    filteredCategories = await app.getGenreTopics(genre);
    if (isSorting) handleSorting();
  }

  const resetGenres = () => {
    if (!activeGenre) return;
    activeGenre = '';
    filteredCategories = categories.map((cat) => ({
      ...cat,
      topics: [...cat.topics], // Ensure a fresh copy of topics
    }));
    if (isSorting) handleSorting();
  };

  // SVG Icons
  let searchSvgFocus: boolean = false;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role a11y_click_events_have_key_events -->
{#if categories && categories.length > 0}
  <section class="filters">
    <div class="sort-genres-filters">
      <div
        class="filter filter-wrapper blur"
        style={activeGenre
          ? 'background-color: rgba(56, 117, 250, 0.9); box-shadow: 0 0 0.5vw rgba(51, 226, 230, 0.5);'
          : ''}
      >
        {#if activeGenre}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -100 200 200"
            class="reset-svg filter-image"
            fill="#dedede"
            stroke="#dedede"
            stroke-width="20"
            stroke-linecap="round"
            stroke-linejoin="round"
            on:click={resetGenres}
            role="button"
            tabindex="0"
          >
            <path
              d="
                M 70 -50
                A 85 85 0 1 0 85 0
              "
              fill="none"
            />
            <polygon
              points="
                70 -50 60 -90 30 -55
              "
            />
          </svg>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -100 200 200"
            class="filter-svg filter-image"
            fill="#dedede"
            stroke="#dedede"
            stroke-width="6"
            stroke-linejoin="round"
          >
            <path
              d="
                M -25 60
                L -25 -15
                L -95 -85
                L -95 -95
                L 95 -95
                L 95 -85
                L 25 -15
                L 25 95
                L 20 95
                Z
              "
            />
          </svg>
        {/if}
        <select class="genre-selector" bind:value={activeGenre}>
          <option value="" selected={true} disabled hidden>Select genre</option>
          {#each genres as genre (genre.id)}
            <option value={genre.name}>{genre.name}</option>
          {/each}
        </select>
      </div>
      <button
        class="filter blur"
        on:click={() => {
          isSorting = !isSorting;
          if (isSorting) {
            handleSorting();
          } else {
            if (activeGenre) {
              getGenre(activeGenre);
            } else {
              filteredCategories = categories.map((cat) => ({
                ...cat,
                topics: [...cat.topics], // Ensure a fresh copy of topics
              }));
            }
          }
        }}
        style={isSorting
          ? 'background-color: rgba(56, 117, 250, 0.9); box-shadow: 0 0 0.5vw rgba(51, 226, 230, 0.5); color: rgb(51, 226, 230); text-shadow: none;'
          : ''}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-100 -100 200 200"
          class="sort-svg filter-image"
          fill={isSorting ? 'rgb(51, 226, 230)' : '#dedede'}
          stroke={isSorting ? 'rgb(51, 226, 230)' : '#dedede'}
          stroke-linejoin="round"
          style="transform: {isSorting ? 'scale(1.1)' : ''}"
        >
          <path
            style="transform: {isSorting ? 'scale(0.9) translateY(10%)' : ''}"
            d="
              M -80 -95
              L -80 34
              L -96 34
              L -72 72
              L -48 34
              L -64 34
              L -64 -95
              Z
            "
            stroke-width="6"
          />
          <rect x="-30" y="-98" width="130" height="20" rx="4" />
          <rect x="-30" y="-48" width="105" height="20" rx="4" />
          <rect x="-30" y="2" width="80" height="20" rx="4" />
          <rect x="-30" y="52" width="55" height="20" rx="4" />
        </svg>
        A-Z
      </button>
    </div>

    <div
      class="filter filter-wrapper blur"
      style={searchField
        ? 'background-color: rgba(56, 117, 250, 0.9); box-shadow: 0 0 0.5vw rgba(51, 226, 230, 0.5);'
        : ''}
    >
      {#if isSearching}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          class="loading-svg filter-image"
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
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-100 -100 200 200"
          class="search-svg filter-image"
          stroke="#dedede"
          stroke-linecap="round"
          fill="none"
          on:click={handleSearchFocus}
          role="button"
          tabindex="0"
          style="transform: {searchSvgFocus
            ? 'scale(1.05) rotate(90deg)'
            : 'none'}"
        >
          <circle cx="-20" cy="-20" r="70" stroke-width="15" />
          <line x1="34" y1="34" x2="85" y2="80" stroke-width="25" />
        </svg>
      {/if}
      <input
        bind:this={searchInput}
        bind:value={searchField}
        on:input={handleSearch}
        on:focus={() => (searchSvgFocus = true)}
        on:blur={() => (searchSvgFocus = false)}
        class="search-field"
        placeholder="Search story..."
      />
    </div>
  </section>

  {#key filteredCategories}
    <div class="categories-wrapper">
      {#each filteredCategories as category (category.name)}
        <StoryCollection {category} {section} />
      {/each}
    </div>
  {/key}
{:else}
  <section class="filters">
    <div class="sort-genres-filters">
      <div
        class="filter filter-wrapper loading-animation blur"
        style="cursor: progress;"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-100 -100 200 200"
          class="filter-svg filter-image"
          fill="#dedede"
          stroke="#dedede"
          stroke-width="6"
          stroke-linejoin="round"
          style="cursor: inherit;"
        >
          <path
            d="
              M -25 60
              L -25 -15
              L -95 -85
              L -95 -95
              L 95 -95
              L 95 -85
              L 25 -15
              L 25 95
              L 20 95
              Z
            "
          />
        </svg>
        <select class="genre-selector" style="cursor: inherit;">
          <option value="" selected={true} disabled hidden>Select genre</option>
        </select>
      </div>
      <button
        class="filter loading-animation blur"
        style="cursor: progress;"
        disabled
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-100 -100 200 200"
          class="sort-svg filter-image"
          fill="#dedede"
          stroke="#dedede"
          stroke-linejoin="round"
        >
          <path
            d="
              M -80 -95
              L -80 34
              L -96 34
              L -72 72
              L -48 34
              L -64 34
              L -64 -95
              Z
            "
            stroke-width="6"
          />
          <rect x="-30" y="-98" width="130" height="20" rx="4" />
          <rect x="-30" y="-48" width="105" height="20" rx="4" />
          <rect x="-30" y="2" width="80" height="20" rx="4" />
          <rect x="-30" y="52" width="55" height="20" rx="4" />
        </svg>
        A-Z
      </button>
    </div>

    <div
      class="filter filter-wrapper loading-animation blur"
      style="cursor: progress;"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-100 -100 200 200"
        class="search-svg filter-image"
        stroke="#dedede"
        stroke-linecap="round"
        fill="none"
        style="cursor: inherit;"
      >
        <circle cx="-20" cy="-20" r="70" stroke-width="15" />
        <line x1="34" y1="34" x2="85" y2="80" stroke-width="25" />
      </svg>
      <input
        class="search-field"
        placeholder="Search story..."
        disabled
        style="cursor: inherit;"
      />
    </div>
  </section>

  <div class="categories-wrapper">
    {#each Array(2) as _}
      <StoryCollection category={null} />
    {/each}
  </div>
{/if}

<Links {section} />

<style>
  .filters {
    z-index: 100;
    width: 95vw;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    gap: 1vw;
  }

  .filter {
    padding: 0 1vw;
    color: #dedede;
  }

  .filter-image {
    height: 2vw !important;
    width: auto;
  }

  .sort-genres-filters {
    display: flex;
    flex-flow: row nowrap;
    gap: 1vw;
  }

  .filter-wrapper {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 1vw;
    padding: 0.5vw;
    padding-left: 1vw;
    font-size: 1.5vw;
    background-color: rgba(56, 117, 250, 0.5);
    border: 0.1vw solid rgba(51, 226, 230, 0.5);
    border-radius: 1vw;
  }

  .genre-selector {
    font-size: 1.5vw;
    line-height: 3vw;
    padding-block: 0.75vw;
    width: 20vw;
    text-align: center;
    outline: none;
    border: 0.1vw solid rgba(51, 226, 230, 0.5);
    border-radius: 0.5vw;
    cursor: pointer;
    /* color: rgba(1, 0, 32, 0.9); */
    /* background-color: rgba(51, 226, 230, 0.5); */
    color: rgba(51, 226, 230, 0.9);
    background-color: rgba(22, 30, 95, 0.9);
  }

  .search-field {
    font-size: 1.5vw;
    line-height: 3vw;
    padding-inline: 0.5vw;
    color: rgba(51, 226, 230, 0.9);
    background-color: rgba(22, 30, 95, 0.9);
    border: 0.1vw solid rgba(51, 226, 230, 0.5);
    border-radius: 0.5vw;
    outline: none;
    width: 19vw;
  }

  .search-field::placeholder {
    color: rgba(51, 226, 230, 0.5);
  }

  .search-field:focus {
    width: 27.5vw;
  }

  .categories-wrapper {
    width: 100vw;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    gap: 2vw;
  }

  @media only screen and (max-width: 600px) {
    .filters {
      width: 90%;
      gap: 1em;
      flex-direction: column;
    }

    .filter {
      border-radius: 0.5em;
      padding: 0.25em;
      width: 33%;
    }

    .filter-image {
      height: 1.5em !important;
      padding: 0.25em;
    }

    .sort-genres-filters {
      gap: 1em;
      justify-content: space-between;
    }

    .filter-wrapper {
      padding: 0.25em;
      border-radius: 0.5em;
      gap: 0.25em;
      font-size: 1em;
      line-height: 1.5em;
      width: 100%;
    }

    .genre-selector {
      font-size: inherit;
      line-height: inherit;
      border-radius: 0.25em;
      padding-block: 0.25em;
      width: 100%;
    }

    .search-field {
      font-size: inherit;
      line-height: inherit;
      border-radius: 0.25em;
      padding: 0.25em 0.5em;
      width: 100% !important;
    }

    .categories-wrapper {
      width: 100vw;
      gap: 1em;
    }
  }
</style>
