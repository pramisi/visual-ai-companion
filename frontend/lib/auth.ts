import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'isSignUp', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: existingUser } = await supabaseAdmin
          .from('user_accounts')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (credentials.isSignUp === 'true') {
          if (existingUser) throw new Error('Email already registered');
          const hashedPassword = await bcrypt.hash(credentials.password, 12);
          const { data: newUser, error } = await supabaseAdmin
            .from('user_accounts')
            .insert({
              email: credentials.email,
              name: credentials.name || 'Learner',
              password_hash: hashedPassword,
            })
            .select()
            .single();
          if (error) throw new Error('Failed to create account');
          return { id: newUser.id, email: newUser.email, name: newUser.name };
        }

        if (!existingUser) throw new Error('No account found');
        const isValid = await bcrypt.compare(credentials.password, existingUser.password_hash);
        if (!isValid) throw new Error('Incorrect password');
        return { id: existingUser.id, email: existingUser.email, name: existingUser.name };
      },
    }),
  ],

  pages: { signIn: '/auth/signin' },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account?.provider === 'google') token.id = token.sub!;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id as string;
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await supabaseAdmin.from('user_progress').upsert(
          { user_id: user.id || user.email!, tree_level: 1, streak_days: 0 },
          { onConflict: 'user_id', ignoreDuplicates: true }
        );
      }
      return true;
    },
  },

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};