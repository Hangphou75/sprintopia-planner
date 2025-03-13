
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { UserDetails } from "./UserDetails";

export const UsersList = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setUsers(data as UserProfile[]);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = activeTab === "all" 
    ? users 
    : users.filter(user => user.role === activeTab);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "coach":
        return "bg-blue-500";
      case "athlete":
        return "bg-green-500";
      case "individual_athlete":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-yellow-500";
      case "standard":
        return "bg-blue-300";
      case "free":
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
  };

  if (selectedUser) {
    return <UserDetails user={selectedUser} onBack={handleCloseDetails} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="coach">Coachs</TabsTrigger>
              <TabsTrigger value="athlete">Athlètes</TabsTrigger>
              <TabsTrigger value="individual_athlete">Athlètes Individuels</TabsTrigger>
              <TabsTrigger value="admin">Administrateurs</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex justify-center">
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Abonnement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role === "coach" ? "Coach" :
                             user.role === "athlete" ? "Athlète" :
                             user.role === "individual_athlete" ? "Athlète Individuel" :
                             user.role === "admin" ? "Admin" : user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.subscription_tier && (
                            <Badge className={getSubscriptionBadgeColor(user.subscription_tier)}>
                              {user.subscription_tier === "premium" ? "Premium" :
                               user.subscription_tier === "standard" ? "Standard" : "Gratuit"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Link to={`/admin/users/${user.id}/edit`}>
                              <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            {user.role === "coach" && (
                              <Link to={`/admin/users/${user.id}/athletes`}>
                                <Button variant="outline" size="icon">
                                  <Users className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {(user.role === "coach" || user.role === "individual_athlete") && (
                              <Link to={`/admin/users/${user.id}/programs`}>
                                <Button variant="outline" size="icon">
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersList;
