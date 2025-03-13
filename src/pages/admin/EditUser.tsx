
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile, SubscriptionTier } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fr } from "date-fns/locale";

const userFormSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  bio: z.string().optional().nullable(),
  role: z.enum(["coach", "athlete", "individual_athlete", "admin"]),
  subscription_tier: z.enum(["free", "standard", "premium"]),
  max_athletes: z.number().nullable().optional(),
  subscription_expiry: z.string().nullable().optional(),
});

export const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      bio: "",
      role: "athlete",
      subscription_tier: "free",
      max_athletes: null,
      subscription_expiry: null,
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          // Formatter la date d'expiration si elle existe
          let formattedExpiry = data.subscription_expiry;
          if (formattedExpiry) {
            const date = new Date(formattedExpiry);
            formattedExpiry = date.toISOString().split("T")[0];
          }

          form.reset({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            bio: data.bio || "",
            role: data.role || "athlete",
            subscription_tier: data.subscription_tier || "free",
            max_athletes: data.max_athletes,
            subscription_expiry: formattedExpiry || null,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Erreur lors du chargement de l'utilisateur");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, form]);

  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    if (!id) return;

    try {
      setSaving(true);

      // Conversion des dates si nécessaire
      let formattedData = { ...values };
      if (formattedData.subscription_expiry) {
        formattedData.subscription_expiry = new Date(formattedData.subscription_expiry).toISOString();
      }

      // Mettre à jour max_athletes selon le niveau d'abonnement pour les coachs
      if (formattedData.role === "coach") {
        if (formattedData.subscription_tier === "free") {
          formattedData.max_athletes = 1;
        } else if (formattedData.subscription_tier === "standard") {
          formattedData.max_athletes = 5;
        } else if (formattedData.subscription_tier === "premium") {
          formattedData.max_athletes = null; // Illimité
        }
      } else {
        // Pour les non-coachs, max_athletes est null
        formattedData.max_athletes = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(formattedData)
        .eq("id", id);

      if (error) throw error;

      toast.success("Utilisateur mis à jour avec succès");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">
          Modifier l'utilisateur
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Chargement des données...</div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""} 
                          placeholder="Bio de l'utilisateur"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="coach">Coach</SelectItem>
                            <SelectItem value="athlete">Athlète</SelectItem>
                            <SelectItem value="individual_athlete">Athlète Individuel</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscription_tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Abonnement</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un niveau d'abonnement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="free">Gratuit</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("role") === "coach" && (
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="subscription_expiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d'expiration de l'abonnement</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUser;
