<script lang="ts">
  import { Account } from '@lib/account';
  import { authenticated } from '@stores/account';

  export let token: string;

  let acct: Account = new Account();
  
  let user: Nullable<User> = null;

  authenticated.subscribe((value) => {
    user = value.user;
  });
</script>

<section>
  <div>
    {#await acct.confirmEmail(user?.email!, token)}
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

<style>
  h2 {
    text-shadow: 0 0 0.5vw #010020;
  }

  section {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5vw;
    background-color: rgba(1, 0, 32, 0.75);
    box-shadow: inset 0 0 0.5vw rgba(51, 226, 230, 0.5);
    border-radius: 1.5vw;
    padding: 2vw 3vw;
  }

  @media only screen and (max-width: 600px) {
    div {
      width: 85vw;
      padding: 1em;
      border-radius: 1em;
      gap: 1em;
    }
  }
</style>
