import { ProfileRow } from '@/types/profile'
import { updateProfile } from '@/app/profile/actions'
import { InputField } from './form/InputField'

interface EditProfileFormProps {
  profile: ProfileRow
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#1e232b] p-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
        Edit Details
      </h3>
      <form action={updateProfile} className="space-y-3">
        <InputField
          id="full_name"
          label="Full Name"
          defaultValue={profile.full_name || ''}
          placeholder="Jane Doe"
        />
        <InputField
          id="username"
          label="Username"
          defaultValue={profile.username || ''}
          placeholder="coffee_lover"
        />
        <InputField
          id="website"
          label="Website"
          type="url"
          defaultValue={profile.website || ''}
          placeholder="https://example.com"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-600"
        >
          Update Profile
        </button>
      </form>
    </div>
  )
}
