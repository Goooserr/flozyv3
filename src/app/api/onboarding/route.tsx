import { resend } from '@/lib/resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, fullName, companyName } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Attempting to send email to:', email);
    const { data, error } = await resend.emails.send({
      from: 'Flozy <bienvenue@flozy.fr>',
      to: [email],
      subject: 'Bienvenue sur Flozy ! 🚀',
      react: <WelcomeEmail fullName={fullName} companyName={companyName} />,
    });

    if (error) {
      console.error('RESEND API ERROR:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log('RESEND SUCCESS:', data);
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('ONBOARDING CATCH ERROR:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
