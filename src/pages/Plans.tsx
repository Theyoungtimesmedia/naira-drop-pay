import { useState, useEffect } from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

interface Plan {
  id: string;
  name: string;
  deposit_usd: number;
  payout_per_drop_usd: number;
  drops_count: number;
  total_return_usd: number;
  is_locked: boolean;
  sort_order: number;
}

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load investment plans');
    } finally {
      setLoading(false);
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const formatDecimal = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getReturnPercentage = (deposit: number, totalReturn: number) => {
    return Math.round(((totalReturn - deposit) / deposit) * 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading plans...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="p-6 pt-12">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground mb-2">Investment Plans</h1>
              <div className="bg-info/10 border border-info/20 rounded-lg px-3 py-1">
                <span className="text-sm font-medium text-info">Luno Rise</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Choose a plan and start earning daily returns on your investment
            </p>

          </div>

          <div className="grid gap-4">
            {plans.map((plan) => {
              const returnPercentage = getReturnPercentage(plan.deposit_usd, plan.total_return_usd);
              
              return (
                <Card key={plan.id} className="relative overflow-hidden bg-card border shadow-sm hover:shadow-md transition-all duration-200">
                  {plan.is_locked && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        Coming Soon
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4 text-center">
                    <div className="flex flex-col items-center">
                      <CardTitle className="text-lg font-bold text-white">{plan.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs bg-white/20 text-white border-white/30">
                        +{returnPercentage}% Return
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-xs text-white/70 mb-1">Deposit Amount</p>
                        <p className="text-xl font-bold text-white">
                          {formatUSD(plan.deposit_usd)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/70 mb-1">Total Return</p>
                        <p className="text-xl font-bold text-green-300">
                          {formatUSD(plan.total_return_usd)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2 border-t border-white/20">
                      <div className="text-center">
                        <p className="text-xs text-white/70 mb-1">Per Drop</p>
                        <p className="text-sm font-semibold text-white">
                          {formatDecimal(plan.payout_per_drop_usd)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/70 mb-1">Total Drops</p>
                        <p className="text-sm font-semibold text-white">
                          {plan.drops_count} times
                        </p>
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        className="w-full h-11 bg-white/20 text-white border-white/30 hover:bg-white/30"
                        variant="outline"
                        size="default"
                        disabled={plan.is_locked}
                        onClick={() => navigate(`/deposit?plan=${plan.id}`)}
                      >
                        {plan.is_locked ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Coming Soon
                          </>
                        ) : (
                          <>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Invest Now
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Plans;