<script lang="ts">
  import Account from '@lib/auth';

  export let token: string;
</script>

<section class="container-wrapper">
  <div class="container blur">
    {#await Account.confirmEmail(token)}
      <h2 style="color: rgb(150, 150, 150)">Verifying Email...</h2>
    {:then response}
      <h2 style="color: rgb(0, 185, 55)">Email Verified</h2>
      <h3>Your email has been verified. You can now login to your account.</h3>
    {:catch error}
      <h2 style="color: rgb(255, 60, 64)">Error</h2>
      <h3>{error.message}</h3>
    {/await}
    <button on:click={() => window.open('/', '_self')}>Return home</button>
  </div>
</section>
