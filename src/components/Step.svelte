<script lang="ts">
  import { afterUpdate } from 'svelte';
  
  import { storyTitle as _storyTitle } from '@libv2/story';
  import { fullscreen, story, loading } from '@stores/conexus';
  import { background_volume, tts_volume } from '@stores/volumes';

  import Slider from './music/Slider.svelte';

  let fullWidthImage: boolean = false;
  let imageWrapper: HTMLDivElement;

  afterUpdate(() => {
    document.onfullscreenchange = () => {
      if ($fullscreen !== !!document.fullscreenElement)
        fullscreen.set(!!document.fullscreenElement);
    };

    if (width <= 600)
      imageWrapper.style.height = fullWidthImage ? 'auto' : '512px';
    else imageWrapper.style.height = 'auto';
  });

  $: if ($fullscreen) document.documentElement.requestFullscreen();
  else if (document.fullscreenElement) document.exitFullscreen();

  $: step = $story?.step_data as StepData;

  let stepFont: string = 'Verdana';
  let width: number;
  const storyTitle: string = (
    _storyTitle.charAt(0).toUpperCase() + _storyTitle.slice(1)
  ).trim();

  let activeOptionNumber: number = 0;
  let pointerOverOption: boolean = false;
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) return;
    switch (event.key) {
      case 'f': {
        $fullscreen = !$fullscreen;
        break;
      }
      case 'ArrowLeft': {
        if ($loading) return;
        if (step.step !== 1) {
          $story?.loadGameStep(step.step - 1);
          handleSelectorSvg(activeOptionNumber, 'blur');
          activeOptionNumber = 0;
        } else return;
        break;
      }
      case 'ArrowRight': {
        if ($loading) return;
        if (step.step !== $story?.maxStep) {
          $story?.loadGameStep(step.step + 1);
          handleSelectorSvg(activeOptionNumber, 'blur');
          activeOptionNumber = 0;
        } else return;
        break;
      }
      case 'ArrowUp': {
        if (step.step !== $story?.maxStep || $loading || pointerOverOption)
          return;
        event.preventDefault();
        handleSelectorSvg(activeOptionNumber, 'blur');
        if ($story?.step_data?.end) activeOptionNumber = 0;
        else if (activeOptionNumber !== 0) activeOptionNumber--;
        const activeOption = document.getElementById(
          `option-${activeOptionNumber}`,
        );
        handleSelectorSvg(activeOptionNumber, 'focus');
        activeOption?.focus();
        break;
      }
      case 'ArrowDown': {
        if (step.step !== $story?.maxStep || $loading || pointerOverOption)
          return;
        event.preventDefault();
        handleSelectorSvg(activeOptionNumber, 'blur');
        if ($story?.step_data?.end) activeOptionNumber = 0;
        else if (activeOptionNumber !== step.options.length - 1)
          activeOptionNumber++;
        const activeOption = document.getElementById(
          `option-${activeOptionNumber}`,
        );
        handleSelectorSvg(activeOptionNumber, 'focus');
        activeOption?.focus();
        break;
      }
    }
  };

  // SVG Icons
  let quitSvgWindowFocus: boolean = false;
  let quitSvgFullscreenFocus: boolean = false;

  let backStepArrowWindowFocus: boolean = false;
  let nextStepArrowWindowFocus: boolean = false;
  let backStepArrowFullscreenFocus: boolean = false;
  let nextStepArrowFullscreenFocus: boolean = false;

  let fullscreenSvgWindowFocus: boolean = false;
  let fullscreenSvgFullscreenFocus: boolean = false;

  const handleSelectorSvg = (id: number, state: 'focus' | 'blur') => {
    if ($story?.step_data?.end) return;
    const selectorSvg = document.getElementById(`selector-${id}`);
    if (state == 'focus') {
      selectorSvg!.style.transform = 'scaleX(1.5)';
      selectorSvg!.style.opacity = '1';
    } else if (state == 'blur') {
      selectorSvg!.style.transform = 'none';
      selectorSvg!.style.opacity = '0.75';
    }
  };
</script>

<svelte:window bind:outerWidth={width} on:keydown={handleKeyDown} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<section class="step-wrapper" style="font-family: {stepFont}">
  <div
    class="image-wrapper"
    bind:this={imageWrapper}
    on:click={() => (fullWidthImage = !fullWidthImage)}
  >
    {#if step.image}
      <img class="image" src={`data:image/png;base64,${step.image}`} alt="" />
    {:else}
      <img class="image loading-image" src="/icons/loading.png" alt="" />
      {#if width <= 600}
        <p class="click-hint">Click to change image size</p>
      {/if}
    {/if}
  </div>

  {#if step.title}
    <h3 class="step-title">{step.title}</h3>
  {/if}

  <article class="story-text">
    {#each step.story.split('\n') as paragraph}
      <p>{paragraph}</p>
    {/each}
  </article>

  {#if $story?.step_data?.end}
    <hr />

    <h2>Story Summary</h2>

    <article class="summary-text">{step.summary}</article>

    <h2>CoNexus identified your trait as: <strong>{step.trait}</strong></h2>

    {#if step.trait_description}
      <article class="summary-text">{step.trait_description}</article>
    {/if}

    <div class="options-container blur">
      <button
        id="option-0"
        class="option menu-option"
        on:click={() => window.open('/', '_self')}>Return to main menu</button
      >
    </div>
  {:else}
    <div class="options-container blur">
      {#each step.options as option, i}
        <button
          id="option-{i}"
          class="option {step.choice
            ? step.choice - 1 === i
              ? 'active-option'
              : ''
            : ''}"
          style="font-family: {stepFont}"
          disabled={$loading || step.step !== $story?.maxStep}
          on:click={() => {
            $story?.nextStep(i + 1);
            if (width < 600) return;
            handleSelectorSvg(i, 'blur');
          }}
          on:pointerover={() => {
            if (width < 600) return;
            if (!$loading && step.step == $story?.maxStep) {
              handleSelectorSvg(i, 'focus');
              pointerOverOption = true;
            }
            if (document.activeElement!.tagName == 'BUTTON') {
              const activeOption = document.activeElement as HTMLButtonElement;
              activeOption.blur();
              handleSelectorSvg(activeOptionNumber, 'blur');
            }
          }}
          on:pointerout={() => {
            if (width < 600) return;
            if (!$loading && step.step == $story?.maxStep) {
              handleSelectorSvg(i, 'blur');
              pointerOverOption = false;
            }
          }}
        >
          {#if width > 600}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              class="option-selector-svg"
              fill="rgb(51, 226, 2305)"
              stroke="rgb(51, 226, 230)"
              stroke-width="20"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon
                id="selector-{i}"
                style="
                  transform: {$loading
                  ? 'none'
                  : step.choice && step.choice - 1 === i
                    ? 'scaleX(1.5)'
                    : 'none'} !important;
                  opacity: {$loading
                  ? '0.75'
                  : step.choice && step.choice - 1 === i
                    ? '1'
                    : '0.75'} !important;
                "
                points="
                  -40 -90 -40 90 50 0
                "
                opacity="0.75"
              />
            </svg>
          {/if}
          {option}
        </button>
      {/each}
    </div>
  {/if}

  <section class="controls-container">
    {#if width > 600}
      <!-- PC NORMAL VIEW -->

      {#if !$fullscreen}
        <div class="control-bar blur">
          <div class="story-info-container">
            <button
              class="quit"
              on:click={() => window.open('./', '_self')}
              on:pointerover={() => (quitSvgWindowFocus = true)}
              on:pointerout={() => (quitSvgWindowFocus = false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-100 -100 200 200"
              >
                <defs>
                  <mask id="quit-svg-mask">
                    <circle r="95" fill="white" />
                    <path
                      class="quit-svg-mask"
                      d="
                        M 50 0
                        L -50 0
                        L 0 -50
                        M -50 0
                        L 0 50
                      "
                      fill="none"
                      stroke="black"
                      stroke-width="25"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      style="transform: {quitSvgWindowFocus
                        ? 'scale(1.2)'
                        : 'none'}"
                    />
                  </mask>
                </defs>

                <circle
                  r="95"
                  fill="rgb(22, 30, 95)"
                  mask="url(#quit-svg-mask)"
                  style="
                    transform: {quitSvgWindowFocus ? 'scale(1.05)' : 'none'};
                    fill: {quitSvgWindowFocus
                    ? 'rgb(1, 0, 32)'
                    : 'rgb(22, 30, 95)'}
                  "
                />
              </svg>
            </button>

            <h3>{storyTitle}</h3>
          </div>

          <div class="controls">
            <Slider type="volume" volume={background_volume} />
            <Slider type="voice" volume={tts_volume} restartable />
            <button
              class="fullscreen"
              on:click={() => ($fullscreen = true)}
              on:pointerover={() => (fullscreenSvgWindowFocus = true)}
              on:pointerout={() => (fullscreenSvgWindowFocus = false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-100 -100 200 200"
                class="fullscreen-svg"
                fill="rgb(22, 30, 95)"
                stroke="rgb(22, 30, 95)"
                stroke-width="25"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-label="Enter fullscreen mode"
                style="
                  transform: {fullscreenSvgWindowFocus ? 'scale(1.05)' : ''};
                  fill: {fullscreenSvgWindowFocus
                  ? 'rgb(1, 0, 32)'
                  : 'rgb(22, 30, 95)'};
                  stroke: {fullscreenSvgWindowFocus
                  ? 'rgb(1, 0, 32)'
                  : 'rgb(22, 30, 95)'};
                "
              >
                <g
                  id="fullscreen-arrow"
                  style="transform: {fullscreenSvgWindowFocus
                    ? 'translate(-2.5%, -2.5%)'
                    : ''}"
                >
                  <line x1="0" y1="0" x2="-55" y2="-55" />
                  <polygon
                    points="
                      -85 -32 -85 -85 -32 -85
                    "
                    stroke-width="15"
                  />
                </g>
                <use href="#fullscreen-arrow" transform="rotate(90)" />
                <use href="#fullscreen-arrow" transform="rotate(180)" />
                <use href="#fullscreen-arrow" transform="rotate(270)" />
              </svg>
            </button>
          </div>
        </div>

        <div class="step-bar blur">
          <button
            class="step-button"
            class:disabled-btn-styling={$loading}
            style={$loading ? 'cursor: progress' : ''}
            on:click={() => {
              if (step.step === 2) backStepArrowWindowFocus = false;
              if (!$loading) $story?.loadGameStep(step.step - 1);
            }}
            on:pointerover={() => {
              if (step.step !== 1 && !$loading) backStepArrowWindowFocus = true;
            }}
            on:pointerout={() => {
              if (step.step !== 1 && !$loading)
                backStepArrowWindowFocus = false;
            }}
            disabled={step.step === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">
              <defs>
                <mask id="back-step-arrow-svg-mask">
                  <circle r="95" fill="white" />
                  <g
                    class="step-arrow-svg-mask"
                    fill="black"
                    stroke="black"
                    style="transform: {backStepArrowWindowFocus
                      ? 'scale(1.2)'
                      : 'none'}"
                  >
                    <polygon
                      points="
                        -50 0 -5 -45 -5 45
                      "
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <rect x="-5" y="-18" width="56" height="36" rx="5" />
                  </g>
                </mask>
              </defs>

              <circle
                r="95"
                fill="rgb(22, 30, 95)"
                mask="url(#back-step-arrow-svg-mask)"
                style="
                  transform: {backStepArrowWindowFocus
                  ? 'scale(1.05)'
                  : 'none'};
                  fill: {backStepArrowWindowFocus
                  ? 'rgb(1, 0, 32)'
                  : 'rgb(22, 30, 95)'}
                "
              />
            </svg>
          </button>
          <h3>Step {`${step.step < 10 ? '0' : ''}${step.step}`}</h3>
          <button
            class="step-button"
            on:click={() => {
              if ($story?.maxStep == step.step + 1)
                nextStepArrowWindowFocus = false;
              $story?.loadGameStep(step.step + 1);
            }}
            on:pointerover={() => {
              if (step.step !== $story?.maxStep)
                nextStepArrowWindowFocus = true;
            }}
            on:pointerout={() => {
              if (step.step !== $story?.maxStep)
                nextStepArrowWindowFocus = false;
            }}
            disabled={step.step === $story?.maxStep}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              style="transform: rotate(180deg)"
            >
              <defs>
                <mask id="next-step-arrow-svg-mask">
                  <circle r="95" fill="white" />
                  <g
                    class="step-arrow-svg-mask"
                    fill="black"
                    stroke="black"
                    style="transform: {nextStepArrowWindowFocus
                      ? 'scale(1.2)'
                      : 'none'}"
                  >
                    <polygon
                      points="
                        -50 0 -5 -45 -5 45
                      "
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <rect x="-5" y="-18" width="56" height="36" rx="5" />
                  </g>
                </mask>
              </defs>

              <circle
                r="95"
                fill="rgb(22, 30, 95)"
                mask="url(#next-step-arrow-svg-mask)"
                style="
                  transform: {nextStepArrowWindowFocus
                  ? 'scale(1.05)'
                  : 'none'};
                  fill: {nextStepArrowWindowFocus
                  ? 'rgb(1, 0, 32)'
                  : 'rgb(22, 30, 95)'}
                "
              />
            </svg>
          </button>
        </div>

        <!-- PC FULLSCREEN VIEW -->
      {:else}
        <div class="control-bar-fullscreen">
          <div class="story-info-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              class="quit-svg-element"
              on:click={() => window.open('/', '_self')}
              role="button"
              tabindex="0"
            >
              <defs>
                <mask id="quit-svg-mask">
                  <circle r="95" fill="white" />
                  <path
                    class="quit-svg-mask"
                    d="
                      M 50 0
                      L -50 0
                      L 0 -50
                      M -50 0
                      L 0 50
                    "
                    fill="none"
                    stroke="black"
                    stroke-width="25"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="transform: {quitSvgFullscreenFocus
                      ? 'scale(1.2)'
                      : 'none'}"
                  />
                </mask>
              </defs>

              <circle
                class="quit-svg"
                r="95"
                fill="rgba(51, 226, 230, 0.5)"
                mask="url(#quit-svg-mask)"
                on:pointerover={() => (quitSvgFullscreenFocus = true)}
                on:pointerout={() => (quitSvgFullscreenFocus = false)}
              />
            </svg>
            <h3 style="color: rgba(51, 226, 230, 0.5)">{storyTitle}</h3>
          </div>

          <div class="step-bar-fullscreen">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              class="step-button-svg-element"
            >
              <defs>
                <mask id="fullscreen-back-step-arrow-svg-mask">
                  <circle r="95" fill="white" />
                  <g
                    class="step-arrow-svg-mask"
                    fill="black"
                    stroke="black"
                    style="transform: {backStepArrowFullscreenFocus
                      ? 'scale(1.2)'
                      : 'none'}"
                  >
                    <polygon
                      points="
                        -50 0 -5 -45 -5 45
                      "
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <rect x="-5" y="-18" width="56" height="36" rx="5" />
                  </g>
                </mask>
              </defs>

              <circle
                class="step-arrow-svg"
                r="95"
                fill="rgba(51, 226, 230, 0.5)"
                mask="url(#fullscreen-back-step-arrow-svg-mask)"
                on:click={() => {
                  if (step.step !== 1 && !$loading)
                    $story?.loadGameStep(step.step - 1);
                  if (step.step === 2) backStepArrowFullscreenFocus = false;
                }}
                on:pointerover={() => {
                  if (step.step !== 1 && !$loading)
                    backStepArrowFullscreenFocus = true;
                }}
                on:pointerout={() => {
                  if (step.step !== 1 && !$loading)
                    backStepArrowFullscreenFocus = false;
                }}
                style={step.step === 1
                  ? 'fill: rgba(51, 226, 230, 0.15); cursor: not-allowed; transform: none;'
                  : $loading
                    ? 'fill: rgba(51, 226, 230, 0.35); cursor: progress; transform: none;'
                    : ''}
              />
            </svg>
            <h3 style="color: rgba(51, 226, 230, 0.5)">
              Step {`${step.step < 10 ? '0' : ''}${step.step}`}
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              class="step-button-svg-element"
              style="transform: rotate(180deg)"
            >
              <defs>
                <mask id="fullscreen-next-step-arrow-svg-mask">
                  <circle r="95" fill="white" />
                  <g
                    class="step-arrow-svg-mask"
                    fill="black"
                    stroke="black"
                    style="transform: {nextStepArrowFullscreenFocus
                      ? 'scale(1.2)'
                      : 'none'}"
                  >
                    <polygon
                      points="
                        -50 0 -5 -45 -5 45
                      "
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <rect x="-5" y="-18" width="56" height="36" rx="5" />
                  </g>
                </mask>
              </defs>

              <circle
                class="step-arrow-svg"
                r="95"
                fill="rgba(51, 226, 230, 0.5)"
                mask="url(#fullscreen-next-step-arrow-svg-mask)"
                on:click={() => {
                  if (step.step !== $story?.maxStep)
                    $story?.loadGameStep(step.step + 1);
                  if ($story?.maxStep == step.step + 1)
                    nextStepArrowFullscreenFocus = false;
                }}
                on:pointerover={() => {
                  if (step.step !== $story?.maxStep)
                    nextStepArrowFullscreenFocus = true;
                }}
                on:pointerout={() => {
                  if (step.step !== $story?.maxStep)
                    nextStepArrowFullscreenFocus = false;
                }}
                style={step.step === $story?.maxStep
                  ? 'fill: rgba(51, 226, 230, 0.15); cursor: not-allowed; transform: none;'
                  : ''}
              />
            </svg>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -100 200 200"
            class="fullscreen-svg fullscreen-svg-element"
            fill="rgb(51, 226, 230)"
            stroke="rgb(51, 226, 230)"
            opacity="0.5"
            stroke-width="20"
            stroke-linecap="round"
            stroke-linejoin="round"
            on:click={() => {
              $fullscreen = false;
              fullscreenSvgFullscreenFocus = false;
            }}
            on:pointerover={() => (fullscreenSvgFullscreenFocus = true)}
            on:pointerout={() => (fullscreenSvgFullscreenFocus = false)}
            style="transform: {fullscreenSvgFullscreenFocus
              ? 'scale(1.05)'
              : ''}"
          >
            <g
              id="windowed-arrow"
              style="transform: {fullscreenSvgFullscreenFocus
                ? 'translate(5%, 5%)'
                : ''}"
            >
              <line x1="-90" y1="-90" x2="-50" y2="-50" />
              <polygon
                points="
                  -85 -32 -32 -32 -32 -85
                "
                stroke-width="12"
                transform="translate(10 10)"
              />
            </g>
            <use href="#windowed-arrow" transform="rotate(90)" />
            <use href="#windowed-arrow" transform="rotate(180)" />
            <use href="#windowed-arrow" transform="rotate(270)" />
          </svg>
        </div>
      {/if}

      <!-- MOBILE VIEW -->
    {:else}
      <div class="control-bar blur">
        <div class="mobile-controls">
          <svg
            class="quit-button-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-100 -100 200 200"
            on:click={() => window.open('/', '_self')}
            role="button"
            tabindex="0"
          >
            <defs>
              <mask id="quit-svg-mask">
                <circle r="95" fill="white" />
                <path
                  d="
                    M 50 0
                    L -50 0
                    L 0 -50
                    M -50 0
                    L 0 50
                  "
                  fill="none"
                  stroke="black"
                  stroke-width="25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </mask>
            </defs>

            <circle
              class="quit-svg"
              r="95"
              fill="#dedede"
              mask="url(#quit-svg-mask)"
            />
          </svg>

          <div class="step-bar">
            <svg
              class="step-button-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              on:click={() => {
                if (step.step !== 1 && !$loading)
                  $story?.loadGameStep(step.step - 1);
              }}
              role="button"
              tabindex="0"
            >
              <defs>
                <mask id="step-arrow-svg-mask">
                  <circle r="95" fill="white" />
                  <g fill="black" stroke="black">
                    <polygon
                      points="
                        -50 0 -5 -45 -5 45
                      "
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <rect x="-5" y="-18" width="56" height="36" rx="5" />
                  </g>
                </mask>
              </defs>

              <circle
                class="step-arrow-svg"
                r="95"
                fill="rgba(51, 226, 230, 0.75)"
                mask="url(#step-arrow-svg-mask)"
                style={step.step === 1
                  ? 'fill: rgba(51, 226, 230, 0.25); transform: none;'
                  : $loading
                    ? 'fill: rgba(51, 226, 230, 0.5); transform: none;'
                    : ''}
              />
            </svg>
            <h3 style="color: rgba(51, 226, 230, 0.75)">
              Step {`${step.step < 10 ? '0' : ''}${step.step}`}
            </h3>
            <svg
              class="step-button-svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              style="transform: rotate(180deg)"
              on:click={() => {
                if (step.step !== $story?.maxStep)
                  $story?.loadGameStep(step.step + 1);
              }}
              role="button"
              tabindex="0"
            >
              <defs>
                <mask id="step-arrow-svg-mask">
                  <circle r="95" fill="white" />
                  <g fill="black" stroke="black">
                    <polygon
                      points="
                        -50 0 -5 -45 -5 45
                      "
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <rect x="-5" y="-18" width="56" height="36" rx="5" />
                  </g>
                </mask>
              </defs>

              <circle
                class="step-arrow-svg"
                r="95"
                fill="rgba(51, 226, 230, 0.75)"
                mask="url(#step-arrow-svg-mask)"
                style={step.step === $story?.maxStep
                  ? 'fill: rgba(51, 226, 230, 0.25); transform: none;'
                  : ''}
              />
            </svg>
          </div>

          {#if $fullscreen}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              class="fullscreen-svg"
              fill="#dedede"
              stroke="#dedede"
              stroke-width="20"
              stroke-linecap="round"
              stroke-linejoin="round"
              on:click={() => fullscreen.update((old) => !old)}
              role="button"
              tabindex="0"
            >
              <g id="windowed-arrow">
                <line x1="-90" y1="-90" x2="-50" y2="-50" />
                <polygon
                  points="
                    -85 -32 -32 -32 -32 -85
                  "
                  stroke-width="12"
                  transform="translate(10 10)"
                />
              </g>
              <use href="#windowed-arrow" transform="rotate(90)" />
              <use href="#windowed-arrow" transform="rotate(180)" />
              <use href="#windowed-arrow" transform="rotate(270)" />
            </svg>
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-100 -100 200 200"
              class="fullscreen-svg"
              fill="#dedede"
              stroke="#dedede"
              stroke-width="20"
              stroke-linecap="round"
              stroke-linejoin="round"
              on:click={() => fullscreen.update((old) => !old)}
              role="button"
              tabindex="0"
            >
              <g id="fullscreen-arrow">
                <line x1="0" y1="0" x2="-55" y2="-55" />
                <polygon
                  points="
                    -85 -32 -85 -85 -32 -85
                  "
                  stroke-width="12"
                />
              </g>
              <use href="#fullscreen-arrow" transform="rotate(90)" />
              <use href="#fullscreen-arrow" transform="rotate(180)" />
              <use href="#fullscreen-arrow" transform="rotate(270)" />
            </svg>
          {/if}
        </div>
        <div class="mobile-sliders">
          <Slider type="volume" volume={background_volume} />
          <Slider type="voice" volume={tts_volume} restartable />
        </div>
      </div>
    {/if}
  </section>
  {#if width <= 600}
    <h3>{storyTitle}</h3>
  {/if}
</section>

<style>
  .step-wrapper {
    font-family: sans-serif;
    font-weight: bold;
    word-spacing: 0.4em;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    gap: 2vw;
    padding: 2vw;
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    border-radius: 1em;
    box-shadow: 0 0 0.5vw #010020;
    -webkit-backdrop-filter: blur(1em);
    backdrop-filter: blur(1em);
    background-color: rgba(51, 226, 230, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 1em;
  }

  .loading-image {
    object-fit: contain;
    animation: pulse 5s linear infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
    }
  }

  .click-hint {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: 1em;
    color: rgb(51, 226, 230);
    animation: pulse 5s linear infinite;
  }

  .step-title {
    color: rgba(51, 226, 230, 0.75);
  }

  .story-text,
  .summary-text {
    width: 100%;
    padding-inline: 1vw;
    font-size: 1.25vw;
    line-height: 2.5vw;
    text-shadow: 0 0.25vw 0.25vw #010020;
    display: flex;
    flex-flow: column nowrap;
    gap: 1vw;
  }

  h2 {
    color: rgba(51, 226, 230, 0.75);
  }

  strong {
    color: rgb(51, 226, 230);
    text-shadow: 0 0 0.1vw rgb(51, 226, 230);
  }

  .options-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1vw;
    border-radius: 1em;
    background-color: rgba(51, 226, 230, 0.05);
    box-shadow:
      inset 0 0 0.5vw rgba(51, 226, 230, 0.25),
      0 0 0.5vw #010020;
  }

  .option {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 0.75em;
    text-align: start;
    font-weight: bold;
    font-size: 1.5vw;
    line-height: 3vw;
    color: rgba(51, 226, 230, 0.75);
    background-color: rgba(0, 0, 0, 0);
    border: none;
  }

  .active-option {
    color: rgb(51, 226, 230) !important;
    text-shadow: 0 0 0.1vw rgb(51, 226, 230) !important;
  }

  .menu-option {
    width: 100%;
    justify-content: center;
  }

  .option:hover,
  .option:active,
  .option:focus {
    color: rgba(51, 226, 230, 1);
    text-shadow: 0 0.25vw 0.5vw #010020;
    filter: none;
    transform: scale(1.025) translateX(0.5%);
  }

  .menu-option:hover,
  .menu-option:active,
  .menu-option:focus {
    transform: scale(1.025);
  }

  .option:disabled {
    opacity: 0.75;
    color: rgba(51, 226, 230, 0.6);
    text-shadow: none !important;
  }

  .option:disabled:hover,
  .option:disabled:active {
    border: none;
    background-color: transparent;
    color: rgba(51, 226, 230, 0.6);
    filter: none;
    transform: none;
  }

  .controls-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
  }

  .controls-container h3 {
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 30vw;
  }

  .control-bar,
  .step-bar {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    gap: 1vw;
    padding: 1vw;
    background-color: rgba(36, 65, 189, 0.75);
    border: 0.1rem solid rgba(51, 226, 230, 0.5);
    border-radius: 1vw;
    box-shadow: 0 0.5vw 0.5vw #010020;
  }

  .control-bar {
    width: 77%;
  }

  .step-bar {
    width: 21%;
  }

  .story-info-container {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: 1vw;
  }

  .controls {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    gap: 1vw;
  }

  .quit,
  .step-button {
    padding: 0.25vw;
  }

  .fullscreen {
    padding: 0.5vw;
  }

  .fullscreen svg {
    height: 2.5vw;
    width: 2.5vw;
  }

  .quit svg,
  .quit-svg-element,
  .step-button svg,
  .step-button-svg-element,
  .fullscreen-svg-element {
    height: 3vw;
    width: 3vw;
  }

  .fullscreen-svg-element:hover,
  .fullscreen-svg-element:active {
    opacity: 1;
  }

  .step-button:disabled {
    opacity: 0.3 !important;
  }

  .control-bar-fullscreen {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    gap: 2vw;
    padding-inline: 1vw;
  }

  .step-bar-fullscreen {
    width: 21%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
  }

  @media screen and (max-width: 600px) {
    .step-wrapper {
      gap: 1em;
      padding: 1em;
    }

    .image-wrapper {
      height: 512px;
    }

    .story-text,
    .summary-text {
      font-size: 1em;
      line-height: 1.75em;
      padding-inline: 0.5em;
      gap: 0.5em;
    }

    .options-container {
      gap: 1em;
      padding: 1em 0.5em;
    }

    .option {
      font-size: 1em;
      line-height: 2em;
    }

    .control-bar {
      flex-flow: column nowrap;
      padding: 0.5em;
      gap: 1em;
      width: 100%;
      border: none;
      border-radius: 1em;
      box-shadow: inset 0 0 0.5vw rgba(51, 226, 230, 0.5);
    }

    .step-bar {
      width: 60%;
      gap: 0.5em;
      border-radius: 0.5em !important;
      color: rgba(51, 226, 230, 0.85);
      box-shadow: inset 0 0 0.5vw #010020;
      background-color: rgba(1, 0, 32, 0.35);
      border: none;
      border-radius: 1em;
      padding: 0.5em;
    }

    .step-bar h3 {
      font-weight: 100;
      max-width: none;
    }

    h3 {
      color: rgba(51, 226, 230, 0.75);
    }

    .mobile-controls {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      padding-inline: 0.25em;
    }

    .mobile-sliders {
      width: 100%;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
    }

    .controls {
      width: 100%;
      justify-content: space-between;
    }

    .quit-button-svg {
      height: 2em;
      width: 2em;
    }

    .fullscreen-svg {
      height: 1.75em;
      width: 1.75em;
    }

    .step-button-svg {
      height: 1.5em;
      width: 1.5em;
    }

    .fullscreen-svg:hover,
    .fullscreen-svg:active {
      fill: rgb(51, 226, 230);
      stroke: rgb(51, 226, 230);
    }
  }

  @media screen and (min-width: 1920px) {
    button {
      padding: 0.25rem !important;
      border-width: 0.05rem !important;
      border-radius: 25%;
    }

    button svg {
      height: 3rem !important;
      width: 3rem !important;
    }

    .fullscreen {
      padding: 0.5rem !important;
    }

    .fullscreen svg {
      height: 2.5rem !important;
      width: 2.5rem !important;
    }

    hr {
      border: 0.1rem solid rgba(51, 226, 230, 0.5);
    }

    h2 {
      font-size: 1.75rem;
      line-height: 1.75rem;
    }

    h3 {
      font-size: 1.75rem;
      line-height: 1.75rem;
    }

    .controls-container h3 {
      max-width: 65rem;
    }

    .story-info-container {
      gap: 1rem;
    }

    .step-wrapper {
      gap: 2rem;
      padding: 2rem;
    }

    .image-wrapper {
      width: 100rem;
      box-shadow: 0 0 0.5rem #010020;
    }

    .story-text,
    .summary-text {
      width: 100rem;
      font-size: 1.5rem;
      line-height: 3rem;
      padding-inline: 1rem;
      gap: 1rem;
    }

    .options-container {
      width: 100rem;
      padding: 1.5rem;
      gap: 1rem;
      box-shadow:
        inset 0 0 0.5rem rgba(51, 226, 230, 0.25),
        0 0 0.5rem #010020;
    }

    .option {
      font-size: 1.75rem;
      line-height: 3.5rem;
      padding: 2rem;
    }

    .option:hover,
    .option:active {
      text-shadow: 0 0.25rem 0.5rem #010020;
    }

    .option-selector-svg {
      height: 2rem !important;
      width: 2rem !important;
    }

    .controls-container {
      width: 100rem;
    }

    .control-bar,
    .step-bar {
      padding: 1rem;
      gap: 1rem;
      box-shadow: 0 0.5rem 0.5rem #010020;
      border-radius: 1rem;
      border-width: 0.05rem;
    }

    .control-bar-fullscreen {
      padding-inline: 1rem;
    }

    .step-bar-fullscreen {
      gap: 1.5rem;
    }

    .controls {
      gap: 1rem;
    }

    .quit-svg-element,
    .step-button-svg-element,
    .fullscreen-svg-element {
      height: 3rem;
      width: 3rem;
    }
  }
</style>
