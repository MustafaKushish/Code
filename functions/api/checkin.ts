export const onRequestPost = async (context: { request: Request }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body: any = await context.request.json();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `CODE-${randomDigits}`;

    return new Response(
      JSON.stringify({
        success: true,
        ticketId,
        message: 'Gerät erfolgreich im Werkstattsystem registriert.',
        estimatedCompletion: 'In ca. 24–48 Stunden',
      }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'Check-in fehlgeschlagen' }),
      { status: 400, headers: corsHeaders }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
