'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserProfile } from '@/types'
import { createClient } from '@/utils/supabase/client'

export function useSupabaseProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setProfile(null)
        setError('User not authenticated')
        return
      }

      // Fetch profile from profiles table
      const { data: profileData, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        throw profileError
      }

      const userProfile: UserProfile = {
        id: (profileData as any)?.id || user.id,
        username: (profileData as any)?.username || user.email?.split('@')[0] || 'User',
        email: (profileData as any)?.email || user.email || '',
        profilePicture: (profileData as any)?.avatar_url || undefined,
        createdAt: (profileData as any)?.created_at || user.created_at || new Date().toISOString(),
      }

      setProfile(userProfile)
      setError(null)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        // Update profiles table
        const { error } = await (supabase
          .from('profiles') as any)
          .update({
            username: updates.username || profile?.username,
            email: updates.email || profile?.email,
            avatar_url: updates.profilePicture || profile?.profilePicture,
          })
          .eq('id', user.id)

        if (error) throw error

        await fetchProfile()
      } catch (err) {
        console.error('Error updating profile:', err)
        throw err
      }
    },
    [supabase, profile, fetchProfile]
  )

  const updateProfilePicture = useCallback(
    async (file: File) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`

        // Upload image to storage
        const { error: uploadError } = await supabase.storage
          .from('Avatar_Profile')
          .upload(fileName, file, { upsert: true })

        if (uploadError) throw uploadError

        // Get public URL
        const { data } = supabase.storage
          .from('Avatar_Profile')
          .getPublicUrl(fileName)

        // Update profiles table with image URL
        await updateProfile({ profilePicture: data.publicUrl })
      } catch (err) {
        console.error('Error updating profile picture:', err)
        throw err
      }
    },
    [supabase, updateProfile]
  )

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setProfile(null)
    } catch (err) {
      console.error('Error logging out:', err)
      throw err
    }
  }, [supabase])

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateProfilePicture,
    logout,
    refetch: fetchProfile,
  }
}
