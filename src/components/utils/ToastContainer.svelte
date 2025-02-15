<script>
  import { toastStore } from '@stores/toast';
  
  import Toast from './Toast.svelte';

  let toasts = [];
  toastStore.subscribe((value) => {
    toasts = value;
  });

  const handleClose = (id) => {
    toastStore.close(id);
  };
</script>

<div class="toast-container">
  {#each toasts as { id, message, type, duration }}
    <Toast {message} {type} {duration} onClose={() => handleClose(id)} />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
  }
</style>
