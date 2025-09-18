import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AdminUser {
  id: string
  username: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface AdminSession {
  id: string
  admin_id: string
  session_token: string
  expires_at: string
  created_at: string
  ip_address?: string
  user_agent?: string
}

export class AdminAuthService {
  private static generateSessionToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  static async authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      // Try to find admin by username or email
      const { data: admin, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .eq('is_active', true)
        .single()

      if (error || !admin) {
        console.log('Admin not found:', error?.message)
        return null
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash)
      if (!isValidPassword) {
        console.log('Invalid password for admin:', username)
        return null
      }

      // Update last login
      await supabaseAdmin
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id)

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        is_active: admin.is_active,
        created_at: admin.created_at,
        updated_at: admin.updated_at,
        last_login: admin.last_login
      }
    } catch (error) {
      console.error('Error authenticating admin:', error)
      return null
    }
  }

  static async createSession(
    adminId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string | null> {
    try {
      const sessionToken = this.generateSessionToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      const { error } = await supabaseAdmin
        .from('admin_sessions')
        .insert({
          admin_id: adminId,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent
        })

      if (error) {
        console.error('Error creating session:', error)
        return null
      }

      return sessionToken
    } catch (error) {
      console.error('Error creating session:', error)
      return null
    }
  }

  static async validateSession(sessionToken: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabaseAdmin
        .rpc('validate_admin_session', { token: sessionToken })

      if (error || !data || data.length === 0) {
        return null
      }

      const sessionData = data[0]
      if (!sessionData.is_valid) {
        return null
      }

      return {
        id: sessionData.admin_id,
        username: sessionData.username,
        email: sessionData.email,
        is_active: true,
        created_at: '',
        updated_at: ''
      }
    } catch (error) {
      console.error('Error validating session:', error)
      return null
    }
  }

  static async destroySession(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken)

      return !error
    } catch (error) {
      console.error('Error destroying session:', error)
      return false
    }
  }

  static async generatePasswordResetToken(email: string): Promise<string | null> {
    try {
      const resetToken = this.generateSessionToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({
          reset_token: resetToken,
          reset_token_expires: expiresAt.toISOString()
        })
        .eq('email', email)

      if (error) {
        console.error('Error generating reset token:', error)
        return null
      }

      return resetToken
    } catch (error) {
      console.error('Error generating reset token:', error)
      return null
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Verify token is valid and not expired
      const { data: admin, error: selectError } = await supabaseAdmin
        .from('admin_users')
        .select('id, reset_token_expires')
        .eq('reset_token', token)
        .single()

      if (selectError || !admin || !admin.reset_token_expires) {
        return false
      }

      const now = new Date()
      const expiresAt = new Date(admin.reset_token_expires)
      if (now > expiresAt) {
        return false
      }

      // Hash new password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(newPassword, saltRounds)

      // Update password and clear reset token
      const { error: updateError } = await supabaseAdmin
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          reset_token: null,
          reset_token_expires: null,
          updated_at: now.toISOString()
        })
        .eq('id', admin.id)

      return !updateError
    } catch (error) {
      console.error('Error resetting password:', error)
      return false
    }
  }

  static async resetPasswordAndGetAdmin(token: string, newPassword: string): Promise<AdminUser | null> {
    try {
      // Verify token is valid and not expired
      const { data: admin, error: selectError } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('reset_token', token)
        .single()

      if (selectError || !admin || !admin.reset_token_expires) {
        return null
      }

      const now = new Date()
      const expiresAt = new Date(admin.reset_token_expires)
      if (now > expiresAt) {
        return null
      }

      // Hash new password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(newPassword, saltRounds)

      // Update password and clear reset token
      const { error: updateError } = await supabaseAdmin
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          reset_token: null,
          reset_token_expires: null,
          updated_at: now.toISOString(),
          last_login: now.toISOString()
        })
        .eq('id', admin.id)

      if (updateError) {
        return null
      }

      return {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        is_active: admin.is_active,
        created_at: admin.created_at,
        updated_at: now.toISOString(),
        last_login: now.toISOString()
      }
    } catch (error) {
      console.error('Error resetting password and getting admin:', error)
      return null
    }
  }

  static async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // Verify current password
      const { data: admin, error } = await supabaseAdmin
        .from('admin_users')
        .select('password_hash')
        .eq('id', adminId)
        .single()

      if (error || !admin) {
        return false
      }

      const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash)
      if (!isValidPassword) {
        return false
      }

      // Hash new password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(newPassword, saltRounds)

      // Update password
      const { error: updateError } = await supabaseAdmin
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)

      return !updateError
    } catch (error) {
      console.error('Error changing password:', error)
      return false
    }
  }
}