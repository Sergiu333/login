'use client'

import {useEffect, useState} from 'react'
import {
  Card,
  TextField,
  Button,
  Banner,
  Layout,
  Page,
  FormLayout
} from '@shopify/polaris'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [shopUrl, setShopUrl] = useState('')
  const [adminToken, setAdminToken] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [activateLoading, setActivateLoading] = useState(false)
  const router = useRouter()

  const handleTestConnection = async () => {
    setTestLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/shopify/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shopUrl,
          adminToken,
          apiKey,
          apiSecret
        })
      })

      if (!response.ok) {
        throw new Error('Conexiunea a eșuat')
      }

      setSuccess('Conexiunea a fost stabilită cu succes!')
    } catch (err) {
      setError('Nu s-a putut stabili conexiunea. Verificați datele introduse.')
    } finally {
      setTestLoading(false)
    }
  }

  const handleActivatePlugin = async () => {
    setActivateLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/shopify/activate-plugin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shopUrl,
          adminToken,
          apiKey,
          apiSecret
        })
      })

      if (!response.ok) {
        throw new Error('Activarea plugin-ului a eșuat')
      }

      setSuccess('Plugin-ul a fost activat cu succes!')
    } catch (err) {
      setError('Nu s-a putut activa plugin-ul. Verificați datele introduse.')
    } finally {
      setActivateLoading(false)
    }
  }

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return <p>Verificare autentificare...</p>;

  return (
    <Page
      title="Setări Magazin"
      subtitle="Configurare conexiune Shopify"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <FormLayout>
              <TextField
                label="URL Magazin"
                value={shopUrl}
                onChange={setShopUrl}
                placeholder="nume-magazin.myshopify.com"
                autoComplete="off"
              />
              <TextField
                label="Admin access token"
                value={adminToken}
                onChange={setAdminToken}
                type="password"
                autoComplete="off"
              />
              <TextField
                label="API key"
                value={apiKey}
                onChange={setApiKey}
                type="password"
                autoComplete="off"
              />
              <TextField
                label="API secret key"
                value={apiSecret}
                onChange={setApiSecret}
                type="password"
                autoComplete="off"
              />

              {error && (
                <Banner tone="critical">
                  <p>{error}</p>
                </Banner>
              )}

              {success && (
                <Banner tone="success">
                  <p>{success}</p>
                </Banner>
              )}

              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={handleTestConnection}
                  loading={testLoading}
                >
                  Testează Conexiunea
                </Button>
              </div>
              <div className="mt-8">
                <Button
                  variant="primary"
                  onClick={handleActivatePlugin}
                  loading={activateLoading}
                >
                  Activează Plugin
                </Button>
              </div>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
} 