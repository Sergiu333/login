'use client';
import { ChangeEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Banner, FormLayout, TextField, Button, BlockStack } from '@shopify/polaris';
import Image from 'next/image';
import {loginUser} from "@/utils/auth";

export default function LoginPage() {
    const [shop, setShop] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!shop || !password) {
            setError('Te rugăm să completezi toate câmpurile');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = await loginUser(shop, password);
            localStorage.setItem('token', data.token); // Salvăm tokenul în localStorage
            router.push('/dashboard'); // Redirect spre dashboard după login
        } catch (err: any) {
            setError('Autentificare eșuată');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f6f7] flex items-center justify-center rounded-2xl">
            <div className="w-full max-w-md">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Card padding="500" roundedAbove="sm">
                        <div className="flex flex-col items-center justify-center mb-6" style={{ placeSelf: 'center' }}>
                            <Image
                                style={{ alignSelf: 'center' }}
                                src="/logoVB.png"
                                alt="Logo"
                                width={190}
                                height={47}
                                priority
                            />
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                            <BlockStack gap="400">
                                {error && (
                                    <Banner tone="critical">
                                        <p>{error}</p>
                                    </Banner>
                                )}

                                <FormLayout>
                                    <TextField
                                        label="Shop"
                                        type="text"
                                        value={shop}
                                        onChange={(value: string, id: string) => setShop(value)}
                                        autoComplete="shop"
                                        autoFocus
                                    />

                                    <TextField
                                        label="Parolă"
                                        type="password"
                                        value={password}
                                        onChange={(value: string, id: string) => setPassword(value)}
                                        autoComplete="current-password"
                                    />


                                    <Button variant="primary" submit loading={loading} fullWidth>
                                        Autentificare
                                    </Button>
                                </FormLayout>
                            </BlockStack>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
