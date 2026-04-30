import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, fullName, companyName } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Flozy <bienvenue@flozy.fr>',
      to: [email],
      subject: 'Bienvenue sur Flozy ! 🚀',
      react: WelcomeEmail({ fullName, companyName }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
