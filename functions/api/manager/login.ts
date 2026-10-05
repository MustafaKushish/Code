export const onRequestPost = async (context: { request: Request }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body: any = await context.request.json();
    const pin = body?.pin || '';

    if (pin.trim() === '2026') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Authentifizierung erfolgreich. Werkstatt-Manager freigegeben.',
          token: `code-cf-${Date.now()}`,
          wwsUrl: 'https://code-ger.com/manager.html',
        }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'PIN ungültig! Zugriff verweigert.',
      }),
      { status: 401, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'Ungültige Anfrage' }),
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
