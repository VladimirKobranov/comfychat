<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useStores } from '@/stores'
import { formatDate } from '@/utils/utils'
import { supabase } from '@/utils/supabase'

const { auth } = useStores()

const saving = ref(false)
const done = ref(false)
const error = ref('')

const showForm = ref(false)
const fields = reactive({
  full_name: '',
  display_name: '',
  bio: '',
})

function resetFields() {
  fields.full_name = auth.user?.user_metadata?.full_name ?? ''
  fields.display_name = auth.user?.user_metadata?.display_name ?? ''
  fields.bio = auth.user?.user_metadata?.bio ?? ''
}

function openForm() {
  resetFields()
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
}

async function save() {
  saving.value = true
  done.value = false
  error.value = ''
  try {
    await auth.updateProfile(fields)
    done.value = true
    showForm.value = false
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    saving.value = false
  }
}

const showEmailForm = ref(false)
const newEmail = ref('')

async function changeEmail() {
  if (!newEmail.value.trim()) return
  saving.value = true
  error.value = ''
  try {
    await supabase.auth.updateUser({ email: newEmail.value })
    done.value = true
    showEmailForm.value = false
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <h2>Account</h2>
    <div class="card">
      <dl>
        <div class="field-row">
          <dt>ID</dt>
          <dd>
            <b class="mono">{{ auth.user?.id }}</b>
          </dd>
        </div>
        <div class="field-row">
          <dt>Email</dt>
          <dd>{{ auth.user?.email }}</dd>
        </div>
      </dl>
      <dl>
        <div class="field-row" v-if="auth.user?.created_at">
          <dt>Registered</dt>
          <dd>{{ formatDate(auth.user.created_at) }}</dd>
        </div>
        <div class="field-row" v-if="auth.user?.last_sign_in_at">
          <dt>Last login</dt>
          <dd>{{ formatDate(auth.user.last_sign_in_at) }}</dd>
        </div>
      </dl>
      <button v-if="!showEmailForm" @click="showEmailForm = true">change email</button>
      <form v-if="showEmailForm" class="form" @submit.prevent="changeEmail">
        <input v-model="newEmail" type="email" placeholder="new email" />
        <div class="row">
          <button type="submit" :disabled="saving">save</button>
          <button type="button" @click="showEmailForm = false">cancel</button>
        </div>
      </form>
    </div>

    <h2>Profile</h2>
    <div class="card">
      <template v-if="!showForm">
        <dl>
          <div class="field-row">
            <dt>Full name</dt>
            <dd>{{ auth.user?.user_metadata?.full_name || '—' }}</dd>
          </div>
          <div class="field-row">
            <dt>Display name</dt>
            <dd>{{ auth.user?.user_metadata?.display_name || '—' }}</dd>
          </div>
          <div class="field-row">
            <dt>Bio</dt>
            <dd>{{ auth.user?.user_metadata?.bio || '—' }}</dd>
          </div>
        </dl>
        <button @click="openForm">edit profile</button>
      </template>
      <form v-else class="form" @submit.prevent="save">
        <label>Full name <input v-model="fields.full_name" /></label>
        <label>Display name <input v-model="fields.display_name" /></label>
        <label>Bio <textarea v-model="fields.bio" rows="3" /></label>
        <div class="row">
          <button type="submit" :disabled="saving">save</button>
          <button type="button" @click="cancelForm">cancel</button>
        </div>
        <p v-if="done">saved</p>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins';

.page {
  @extend %column-layout;
  @extend %gap;
  max-width: 480px;
}

.card {
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: start;
}

.card > * + * {
  margin-top: 8px;
}

dl {
  margin: 0;
}

.field-row {
  @extend %row-layout;
  @extend %gap;
  align-items: baseline;
}

dt {
  min-width: 100px;
  color: #666;
  font-size: 0.85em;
  text-align: justify;
}

dd {
  margin: 0;
  word-break: break-all;
}

.mono {
  font-size: 0.8em;
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
    box-sizing: border-box;
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
