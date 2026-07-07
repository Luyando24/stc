import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, FileText, Ship, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const [bookingsData, quotesData] = await Promise.all([
        pb.collection('bookings').getList(1, 50, {
          filter: `created_by = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        }),
        pb.collection('quotes').getList(1, 50, {
          filter: `created_by = "${currentUser.id}"`,
          sort: '-created',
          $autoCancel: false
        })
      ]);

      setBookings(bookingsData.items);
      setQuotes(quotesData.items);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return colors[status] || 'bg-muted text-muted-foreground border-border';
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Manage Your Shipments | STC Logistics</title>
        <meta name="description" content="View and manage your bookings, quotes, and shipments in one place." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-16 pt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <img 
                src="https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/91c3316b37877915e0b394987b992669.png"
                alt="STC Logistics"
                className="logo-md mb-6 logo-responsive mix-blend-multiply"
              />
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Dashboard</h1>
              <p className="text-lg font-medium text-muted-foreground">
                Welcome back, {currentUser?.name || currentUser?.email}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
            >
              <div className="bg-card rounded-2xl shadow-sm p-8 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Package className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">{bookings.length}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Total Bookings</h3>
                <p className="text-sm font-medium text-muted-foreground">Active shipments</p>
              </div>

              <div className="bg-card rounded-2xl shadow-sm p-8 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20">
                    <FileText className="w-7 h-7 text-secondary" />
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">{quotes.length}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Quotes</h3>
                <p className="text-sm font-medium text-muted-foreground">Pending and accepted</p>
              </div>

              <div className="bg-card rounded-2xl shadow-sm p-8 border border-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                    <Ship className="w-7 h-7 text-accent" />
                  </div>
                  <span className="text-3xl font-extrabold text-foreground">
                    {bookings.filter(b => b.status === 'shipped').length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">In Transit</h3>
                <p className="text-sm font-medium text-muted-foreground">Currently shipping</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Button asChild className="bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90" size="lg">
                <Link to="/booking">
                  <Plus className="w-5 h-5 mr-2" />
                  New Booking
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="font-bold border-border bg-card shadow-sm hover:bg-muted text-foreground" asChild>
                <Link to="/track">
                  <Search className="w-5 h-5 mr-2" />
                  Track Shipment
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Tabs defaultValue="bookings" className="w-full">
                <TabsList className="mb-8 p-1 bg-muted rounded-xl">
                  <TabsTrigger value="bookings" className="rounded-lg font-bold text-base px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Bookings</TabsTrigger>
                  <TabsTrigger value="quotes" className="rounded-lg font-bold text-base px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm">Quotes</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                  {isLoading ? (
                    <div className="text-center py-16">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-medium">Loading bookings...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
                      <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-foreground mb-3">No bookings yet</h3>
                      <p className="text-lg font-medium text-muted-foreground mb-8">Create your first booking to get started</p>
                      <Button asChild className="bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90" size="lg">
                        <Link to="/booking">Create Booking</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted border-b border-border">
                            <tr>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Service</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Route</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Weight</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Status</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {bookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-5 text-sm font-bold text-foreground capitalize">
                                  {booking.service_type.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                  {booking.origin} → {booking.destination}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                  {booking.weight} kg
                                </td>
                                <td className="px-6 py-5">
                                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(booking.status)}`}>
                                    {booking.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                  {formatDate(booking.created)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quotes">
                  {isLoading ? (
                    <div className="text-center py-16">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-medium">Loading quotes...</p>
                    </div>
                  ) : quotes.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
                      <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-foreground mb-3">No quotes yet</h3>
                      <p className="text-lg font-medium text-muted-foreground mb-8">Request a quote to see pricing</p>
                      <Button asChild className="bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90" size="lg">
                        <Link to="/booking">Request Quote</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted border-b border-border">
                            <tr>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Service</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Route</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Weight</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Amount</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Status</th>
                              <th className="px-6 py-5 text-left text-sm font-bold text-foreground">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {quotes.map((quote) => (
                              <tr key={quote.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-5 text-sm font-bold text-foreground capitalize">
                                  {quote.service_type.replace('_', ' ')}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                  {quote.origin} → {quote.destination}
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                  {quote.weight} kg
                                </td>
                                <td className="px-6 py-5 text-sm font-extrabold text-primary">
                                  ${quote.quote_amount}
                                </td>
                                <td className="px-6 py-5">
                                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(quote.status)}`}>
                                    {quote.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                                  {formatDate(quote.created)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default DashboardPage;