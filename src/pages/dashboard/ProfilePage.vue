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
    <table class="info-table">
      <tbody>
        <tr>
          <td>ID</td>
          <td>
            <code>{{ auth.user?.id }}</code>
          </td>
        </tr>
        <tr>
          <td>Email</td>
          <td>{{ auth.user?.email }}</td>
        </tr>
        <tr v-if="auth.user?.created_at">
          <td>Registered</td>
          <td>{{ formatDate(auth.user.created_at) }}</td>
        </tr>
        <tr v-if="auth.user?.last_sign_in_at">
          <td>Last login</td>
          <td>{{ formatDate(auth.user.last_sign_in_at) }}</td>
        </tr>
        <tr>
          <td>Email confirmed</td>
          <td>
            {{ auth.user?.email_confirmed_at ? formatDate(auth.user.email_confirmed_at) : 'no' }}
          </td>
        </tr>
      </tbody>
    </table>

    <template v-if="!showEmailForm">
      <button @click="showEmailForm = true">change email</button>
    </template>
    <form v-else class="form profile-form" @submit.prevent="changeEmail">
      <table class="info-table">
        <tbody>
          <tr>
            <td><label>Email</label></td>
            <td><input v-model="newEmail" type="email" placeholder="new email" /></td>
          </tr>
        </tbody>
      </table>
      <div class="row">
        <button type="submit" :disabled="saving">save</button>
        <button type="button" @click="showEmailForm = false">cancel</button>
      </div>
    </form>

    <h2>Profile</h2>
    <template v-if="!showForm">
      <table class="info-table">
        <tbody>
          <tr>
            <td>Full name</td>
            <td>{{ auth.user?.user_metadata?.full_name || '—' }}</td>
          </tr>
          <tr>
            <td>Display name</td>
            <td>{{ auth.user?.user_metadata?.display_name || '—' }}</td>
          </tr>
          <tr>
            <td>Bio</td>
            <td>{{ auth.user?.user_metadata?.bio || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <button @click="openForm">edit profile</button>
    </template>
    <form v-else class="form profile-form" @submit.prevent="save">
      <table class="info-table">
        <tbody>
          <tr>
            <td><label>Full name</label></td>
            <td><input v-model="fields.full_name" /></td>
          </tr>
          <tr>
            <td><label>Display name</label></td>
            <td><input v-model="fields.display_name" /></td>
          </tr>
          <tr>
            <td><label>Bio</label></td>
            <td><textarea v-model="fields.bio" rows="3" /></td>
          </tr>
        </tbody>
      </table>
      <div class="row">
        <button type="submit" :disabled="saving">save</button>
        <button type="button" @click="cancelForm">cancel</button>
      </div>
      <p v-if="done">saved</p>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<style lang="scss">
@use '@/styles/mixins';

.info-table {
  width: 100%;
  text-align: left;

  td:last-child {
    text-align: end;
  }

  input,
  textarea {
    width: 100%;
  }
}
.row {
  @extend %row-layout, %gap;
}

.profile-form {
  width: 100%;
  align-items: center;
}
</style>
