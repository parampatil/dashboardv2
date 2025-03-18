// app/dashboard/consumerpurchase/available-offers/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/useApi";
import { useEnvironment } from "@/context/EnvironmentContext";
import { Offer } from "@/types/grpc";
import { DollarSign, Clock, Tag, Globe } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AvailableOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const { toast } = useToast();
  const api = useApi();
  const {currentEnvironment} = useEnvironment();

  const countries = [
    { code: "US", name: "United States" },
    { code: "IN", name: "India" },
    { code: "CA", name: "Canada" },
    { code: "UK", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "JP", name: "Japan" }
  ];

  

  useEffect(() => {
    const fetchOffers = async (country: string) => {
      setLoading(true);
      try {
        const response = await api.fetch("/api/grpc/consumerpurchase/available-offers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country })
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error.details || data.error.errorMessage);
        }
  
        setOffers(data.offers);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch available offers",
          description: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOffers(selectedCountry);
  }, [selectedCountry, currentEnvironment]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  return (
    <ProtectedRoute allowedRoutes={["/dashboard/consumerpurchase/available-offers"]}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Available Offers
            </h1>
            
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-500" />
              <Select value={selectedCountry} onValueChange={handleCountryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <OfferCard key={offer.offerId} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No offers available for {countries.find(c => c.code === selectedCountry)?.name || selectedCountry}.</p>
            </div>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}

function OfferCard({ offer }: { offer: Offer }) {
  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-shadow duration-300"
      whileHover={{
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 10,
      }}
    >
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
        <h3 className="text-lg font-semibold text-white">{offer.offerName}</h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-5 w-5 text-blue-500" />
          <span>{offer.numberOfMinutes} Minutes</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="h-5 w-5 text-green-500" />
          <span>{offer.totalPrice} {offer.currency}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Tag className="h-5 w-5 text-amber-500" />
          <span>{offer.pricePerMinute} {offer.currency}/min</span>
        </div>
        
        <div className="pt-2 text-xs text-gray-500">
          Offer ID: {offer.offerId}
        </div>
      </div>
    </motion.div>
  );
}
