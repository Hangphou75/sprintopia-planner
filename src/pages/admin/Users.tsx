
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, User, Users2 } from "lucide-react";

// Mock data
const USERS = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "coach", status: "active", athletes: 12 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "coach", status: "active", athletes: 8 },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "individual_athlete", status: "active", athletes: 0 },
  { id: "4", name: "Alice Williams", email: "alice@example.com", role: "coach", status: "inactive", athletes: 3 },
  { id: "5", name: "Charlie Brown", email: "charlie@example.com", role: "athlete", status: "active", athletes: 0 },
];

export default function Users() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredUsers = USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleUserClick = (id: string) => {
    navigate(`/admin/users/${id}`);
  };
  
  const handleViewAthletes = (id: string) => {
    navigate(`/admin/users/${id}`);
  };
  
  const handleEditUser = (id: string) => {
    navigate(`/admin/users/${id}/edit`);
  };
  
  const handleViewCompetitions = (id: string) => {
    navigate(`/admin/users/${id}/competitions`);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Gestion des Utilisateurs</h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>Ajouter un utilisateur</Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-center">Athlètes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="cursor-pointer" onClick={() => handleUserClick(user.id)}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div>{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">{user.role.replace('_', ' ')}</div>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {user.role === 'coach' ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAthletes(user.id);
                      }}
                    >
                      <span>{user.athletes}</span>
                      <Users2 className="h-4 w-4" />
                    </Button>
                  ) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                        Modifier
                      </DropdownMenuItem>
                      {user.role === 'coach' && (
                        <DropdownMenuItem onClick={() => handleViewAthletes(user.id)}>
                          Voir les athlètes
                        </DropdownMenuItem>
                      )}
                      {(user.role === 'coach' || user.role === 'athlete') && (
                        <DropdownMenuItem onClick={() => handleViewCompetitions(user.id)}>
                          Voir les compétitions
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
