export async function loginUser(shop: string, password: string) {
    const res = await fetch('https://api.ecompay.md/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop, password }),
    });

    if (!res.ok) throw new Error('Login failed');
    return res.json();
}
