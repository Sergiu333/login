"use client";

import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Grid,
} from "@shopify/polaris";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function DashboardPage() {
  const paymentMethods = [
    {
      id: "visa-mastercard",
      title: "Victoriabank Visa/MasterCard",
      description: "Plată cu cardul bancar",
      status: "Activ",
      settingsPath: "/dashboard/settings/visa-mastercard",
    },
    {
      id: "star-card",
      title: "Victoriabank Star Card Rate",
      description: "Plată în rate cu cardul Star",
      status: "Inactiv",
      settingsPath: "/dashboard/settings/star-card",
    },
    {
      id: "star-points",
      title: "Victoriabank Puncte Star",
      description: "Plată cu puncte Star",
      status: "Inactiv",
      settingsPath: "/dashboard/settings/star-points",
    },
    {
      id: "mia",
      title: "MIA",
      description: "Plată prin MIA",
      status: "Inactiv",
      settingsPath: "/dashboard/settings/mia",
    },
  ];

  // const router = useRouter();
  // const [authorized, setAuthorized] = useState(false);
  //
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     router.push('/login');
  //   } else {
  //     setAuthorized(true);
  //   }
  // }, []);
  //
  // if (!authorized) return <p>Verificare autentificare...</p>;

  return (
    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Metode de plată disponibile</h2>
              <Grid>
                {paymentMethods.map((method) => (
                  <Grid.Cell key={method.id} columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                    <Card>
                      <div className="p-6 h-full flex flex-col">
                        <div className="mb-4">
                          <Text as="h3" variant="headingMd">
                            {method.title}
                          </Text>
                        </div>
                        <div className="flex-grow">
                          <Text as="p" variant="bodyMd">
                            {method.description}
                          </Text>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className={method.status === "Activ" ? "text-green-600" : "text-red-600"}>
                            <Text as="span" variant="bodySm">
                              {method.status}
                            </Text>
                          </div>
                          <Link href={method.settingsPath}>
                            <Button>Configurează</Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </Grid.Cell>
                ))}
              </Grid>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}