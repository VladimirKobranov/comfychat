<script setup lang="ts">
import { ref, reactive } from "vue";
import { useStores } from "@/stores";
import { formatDate } from "@/utils/utils";
import { supabase } from "@/utils/supabase";

const { auth } = useStores();

const saving = ref(false);
const done = ref(false);
const error = ref("");

const showForm = ref(false);
const fields = reactive({
  full_name: "",
  display_name: "",
  bio: "",
});

function resetFields() {
  fields.full_name = auth.user?.user_metadata?.full_name ?? "";
  fields.display_name = auth.user?.user_metadata?.display_name ?? "";
  fields.bio = auth.user?.user_metadata?.bio ?? "";
}

function openForm() {
  resetFields();
  showForm.value = true;
}

function cancelForm() {
  showForm.value = false;
}

async function save() {
  saving.value = true;
  done.value = false;
  error.value = "";
  try {
    await auth.updateProfile(fields);
    done.value = true;
    showForm.value = false;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    saving.value = false;
  }
}

const showEmailForm = ref(false);
const newEmail = ref("");

async function changeEmail() {
  if (!newEmail.value.trim()) return;
  saving.value = true;
  error.value = "";
  try {
    await supabase.auth.updateUser({ email: newEmail.value });
    done.value = true;
    showEmailForm.value = false;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="page">
    <section>
      <h4>Account</h4>
      <div class="field-row">
        <span class="label">id</span>
        <span>{{ auth.user?.id }}</span>
      </div>
      <div class="field-row">
        <span class="label">email</span>
        <span>{{ auth.user?.email }}</span>
        <button v-if="!showEmailForm" @click="showEmailForm = true">change</button>
      </div>
      <form v-if="showEmailForm" class="form" @submit.prevent="changeEmail">
        <input v-model="newEmail" type="email" placeholder="new email" />
        <div class="row">
          <button type="submit" :disabled="saving">save</button>
          <button type="button" @click="showEmailForm = false">cancel</button>
        </div>
      </form>
      <div v-if="auth.user?.created_at" class="field-row">
        <span class="label">registered</span>
        <span>{{ formatDate(auth.user.created_at) }}</span>
      </div>
      <div v-if="auth.user?.last_sign_in_at" class="field-row">
        <span class="label">last login</span>
        <span>{{ formatDate(auth.user.last_sign_in_at) }}</span>
      </div>
    </section>

    <section>
      <h4>Profile</h4>
      <div v-if="!showForm" class="column">
        <div class="field-row">
          <span class="label">full name</span>
          <span>{{ auth.user?.user_metadata?.full_name ?? "—" }}</span>
        </div>
        <div class="field-row">
          <span class="label">display name</span>
          <span>{{ auth.user?.user_metadata?.display_name ?? "—" }}</span>
        </div>
        <div class="field-row">
          <span class="label">bio</span>
          <span>{{ auth.user?.user_metadata?.bio ?? "—" }}</span>
        </div>
        <button @click="openForm">edit</button>
      </div>
      <form v-else class="form" @submit.prevent="save">
        <label>full name <input v-model="fields.full_name" /></label>
        <label>display name <input v-model="fields.display_name" /></label>
        <label>bio <textarea v-model="fields.bio" rows="3" /></label>
        <div class="row">
          <button type="submit" :disabled="saving">save</button>
          <button type="button" @click="cancelForm">cancel</button>
        </div>
        <p v-if="done">saved</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/mixins";

.page {
  @extend %column-layout;
  @extend %gap;
  max-width: 480px;
}

.section {
  @extend %column-layout;
  @extend %gap;
  @extend %border;
}

.field-row {
  @extend %row-layout;
  @extend %gap;
  align-items: baseline;
}

.label {
  min-width: 100px;
  color: #666;
}

.form {
  @extend %column-layout;
  @extend %gap;

  label {
    @extend %column-layout;
    gap: 3px;
  }

  input,
  textarea {
    width: 100%;
  }
}

.row {
  @extend %row-layout;
  @extend %gap;
}

.error {
  color: #e00;
}
</style>
