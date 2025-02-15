<script lang="ts">
  import { Account } from '@libv2/account';
  import { toastStore } from '@stores/toast';

  let code: string = '';

  let acct: Account = new Account();

  const useReferralCode = async () => {
    try {
      await acct.useReferralCode(code);
      toastStore.show('Referral code submitted successfully!');
      window.location.href = '/'; // Redirect to the home page
    } catch (error) {
      console.error('Error using referral code:', error);
      toastStore.show('Failed to use referral code. Please try again.');
    }
  };

  $: if (code.length === 16) validateReferralCode();
  $: if (code.length < 16) referralCodeValid = false;
  let referralCodeValid = false;
  async function validateReferralCode() {
    const referralObject: ReferralCode | null =
      await acct.validateReferralCode(code);
    if (referralObject) {
      referralCodeValid = true;
    } else {
      referralCodeValid = false;
    }
  }
</script>

<h2>Please provide a referral code to complete your registration.</h2>

<div class="referral-container">
  <div class="ref-code-form blur">
    <label class="signup-label" for="referral-code">
      Enter your referral code:
    </label>
    <input
      class="user-input"
      type="text"
      id="referral-code"
      placeholder="A11A7528D9C82915"
      minlength="16"
      maxlength="16"
      bind:value={code}
      required
      style={code
        ? referralCodeValid
          ? ''
          : 'border: 0.1vw solid rgba(255, 50, 50, 0.75);'
        : 'border: 0.1vw solid rgba(255, 50, 50, 0.75);'}
    />

    {#if code.length === 16}
      {#await acct.validateReferralCode(code)}
        <p class="validation gray">Checking referral code...</p>
      {:then referralObject}
        {#if referralObject}
          <p class="validation green">Referral code is valid</p>
        {:else}
          <p class="validation">Referral code is invalid</p>
        {/if}
      {:catch}
        <p class="validation">Some error occured...</p>
      {/await}
    {:else if code}
      <p class="validation">Code should contain 16 characters</p>
    {/if}

    <p class="signup-label">
      Don't have one yet? Find yours
      <a
        href="https://discord.gg/349FgMSUK8"
        target="_blank"
        rel="noopener noreferrer">here</a
      >!
    </p>
    <button
      class="submit-button"
      on:click={useReferralCode}
      disabled={!referralCodeValid}
    >
      Use Referral Code
    </button>
  </div>
</div>

<style>
  h2 {
    margin-bottom: 2vw;
    text-shadow: 0 0 0.5vw #010020;
  }

  .referral-container {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .ref-code-form {
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

  .signup-label {
    font-size: 1.5vw;
    line-height: 2vw;
    color: rgba(51, 226, 230, 0.75);
    text-align: center;
  }

  @media only screen and (max-width: 600px) {
    h2 {
      margin-bottom: 2em;
    }

    .ref-code-form {
      width: 85vw;
      padding: 1em;
      border-radius: 1em;
      gap: 1em;
    }

    .signup-label {
      font-size: 1em;
      line-height: 1.5em;
    }
  }
</style>
