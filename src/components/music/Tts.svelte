<script lang="ts">
  import { onMount } from 'svelte';

  import { story } from '@stores/conexus';
  import { tts_volume } from '@stores/volumes';

  let audio: HTMLAudioElement;
  let last_tts: Blob | null = null;

  onMount(() => {
    let tts: Blob | null = null;
    story.subscribe((story) => {
      const step = story?.step_data as StepData;

      if (step && step.tts && last_tts !== step.tts) {
        audio.src = window.URL.createObjectURL(step.tts);
        audio.play();

        tts = step.tts;
        last_tts = step.tts;
      }
    });

    tts_volume.subscribe(({ muted, volume, restart }) => {
      if (restart) {
        if (tts) {
          audio.src = window.URL.createObjectURL(tts);
          audio.play();
        }

        tts_volume.set({ muted, volume, restart: false });

        return;
      }

      audio.volume = !muted ? volume : 0;
    });
  });
</script>

<audio bind:this={audio}></audio>
