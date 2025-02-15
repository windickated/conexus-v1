<script lang="ts">
  import { Account } from '@lib/account';

  export let token: string;

  let acct: Account = new Account();

  let email: string = '';
  let password: string = '';
  let passwordConfirm: string = '';

  $: passwordsMatch = password && password === passwordConfirm;
  $: emailExists = true; // fake validation

  $: validation =
    email && emailExists && password.length >= 8 && passwordsMatch;
</script>

<h2>You will receive a confirmation email with link.</h2>

<div class="reset-password-container">
  <div class="reset-password-form blur">
    <input
      class="user-input"
      type="email"
      bind:value={email}
      placeholder="Email"
      required
      style={email
        ? emailExists
          ? ''
          : 'border: 0.1vw solid rgba(255, 50, 50, 0.75);'
        : 'border: 0.1vw solid rgba(255, 50, 50, 0.75);'}
    />

    {#if !email}
      <p class="validation">Provide the email associated with your profile</p>
    {:else if !emailExists}
      <p class="validation">
        This email is not linked with any existing profile!
      </p>
    {/if}

    <input
      class="user-input"
      type="password"
      bind:value={password}
      placeholder="New password"
      required
      autocomplete="new-password"
      style={password
        ? password.length < 8
          ? 'border: 0.1vw solid rgba(255, 50, 50, 0.75);'
          : ''
        : 'border: 0.1vw solid rgba(255, 50, 50, 0.75);'}
    />
    <input
      class="user-input"
      type="password"
      bind:value={passwordConfirm}
      placeholder="Confirm new password"
      required
      style={password && !passwordsMatch
        ? 'border: 0.1vw solid rgba(255, 50, 50, 0.75);'
        : ''}
    />

    {#if !password}
      <p class="validation">Provide new password</p>
    {:else if password.length < 8}
      <p class="validation">Password should contain at least 8 characters!</p>
    {:else if !passwordsMatch}
      <p class="validation">Passwords do not match!</p>
    {/if}

    <button
      on:click={() => acct.resetPassword({ email, password, token })}
      disabled={!validation}
    >
      Reset Password
    </button>
  </div>
</div>

<style>
  h2 {
    margin-bottom: 2vw;
    text-shadow: 0 0 0.5vw #010020;
  }

  .reset-password-container {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .reset-password-form {
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
    h2 {
      margin-bottom: 2em;
    }

    .reset-password-form {
      width: 85vw;
      padding: 1em;
      border-radius: 1em;
      gap: 1em;
    }
  }
</style>
