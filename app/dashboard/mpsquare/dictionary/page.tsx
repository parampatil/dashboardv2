// // app/dashboard/mp2/dictionary/page.tsx
// "use client";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import { useToast } from "@/hooks/use-toast";
// import { useApi } from "@/hooks/useApi";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Plus } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function CrimeDictionary() {
//   const [crimeWords, setCrimeWords] = useState<CriemWord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [newWord, setNewWord] = useState("");
//   const [newCategory, setNewCategory] = useState("");
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [selectedWord, setSelectedWord] = useState<CrimeWord | null>(null);
//   const [newVariant, setNewVariant] = useState("");
//   const { toast } = useToast();
//   const api = useApi();

//   useEffect(() => {
//     fetchCrimeWords();
//   }, []);

//   const fetchCrimeWords = async () => {
//     setLoading(true);
//     try {
//       const response = await api.fetch("/api/grpc/mp2/dictionary/get-crime-words");
//       const data = await response.json();
//       setCrimeWords(data.crimeWords);
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Failed to fetch crime words",
//         description: (error as Error).message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddCrimeWord = async () => {
//     try {
//       await api.fetch("/api/grpc/mp2/dictionary/add-crime-word", {
//         method: "POST",
//         body: JSON.stringify({ word: newWord, category: newCategory }),
//       });
//       toast({
//         title: "Crime word added",
//         description: "The new crime word has been added successfully.",
//       });
//       setIsAddDialogOpen(false);
//       setNewWord("");
//       setNewCategory("");
//       fetchCrimeWords();
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Failed to add crime word",
//         description: (error as Error).message,
//       });
//     }
//   };

//   const handleDeactivateCrimeWord = async (crimeWordId: string) => {
//     try {
//       await api.fetch("/api/grpc/mp2/dictionary/deactivate-crime-word", {
//         method: "POST",
//         body: JSON.stringify({ crimeWordId }),
//       });
//       toast({
//         title: "Crime word deactivated",
//         description: "The crime word has been deactivated successfully.",
//       });
//       fetchCrimeWords();
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Failed to deactivate crime word",
//         description: (error as Error).message,
//       });
//     }
//   };

//   const handleAddVariant = async () => {
//     if (!selectedWord) return;
//     try {
//       await api.fetch("/api/grpc/mp2/dictionary/add-crime-word-variant", {
//         method: "POST",
//         body: JSON.stringify({ crimeWordId: selectedWord.id, variant: newVariant }),
//       });
//       toast({
//         title: "Variant added",
//         description: "The new variant has been added successfully.",
//       });
//       setSelectedWord(null);
//       setNewVariant("");
//       fetchCrimeWords();
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Failed to add variant",
//         description: (error as Error).message,
//       });
//     }
//   };

//   return (
//     <ProtectedRoute allowedRoutes={["/dashboard/mp2/dictionary"]}>
//       <motion.div
//         className="space-y-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold text-gray-800">Crime Dictionary</h1>
//             <Button onClick={() => setIsAddDialogOpen(true)}>
//               <Plus className="mr-2 h-4 w-4" /> Add Crime Word
//             </Button>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Word</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Variants</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {crimeWords.map((word) => (
//                   <TableRow key={word.id}>
//                     <TableCell>{word.word}</TableCell>
//                     <TableCell>{word.category}</TableCell>
//                     <TableCell>{word.variants.join(", ")}</TableCell>
//                     <TableCell>{word.isActive ? "Active" : "Inactive"}</TableCell>
//                     <TableCell>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => setSelectedWord(word)}
//                         className="mr-2"
//                       >
//                         Add Variant
//                       </Button>
//                       {word.isActive && (
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           onClick={() => handleDeactivateCrimeWord(word.id)}
//                         >
//                           Deactivate
//                         </Button>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </div>

//         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add New Crime Word</DialogTitle>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <Input
//                 placeholder="Enter crime word"
//                 value={newWord}
//                 onChange={(e) => setNewWord(e.target.value)}
//               />
//               <Select value={newCategory} onValueChange={setNewCategory}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select category" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="profanity">Profanity</SelectItem>
//                   <SelectItem value="hate_speech">Hate Speech</SelectItem>
//                   <SelectItem value="violence">Violence</SelectItem>
//                   <SelectItem value="sexual_content">Sexual Content</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddCrimeWord}>Add Word</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Add Variant for &quot;{selectedWord?.word}&quot;</DialogTitle>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <Input
//                 placeholder="Enter variant"
//                 value={newVariant}
//                 onChange={(e) => setNewVariant(e.target.value)}
//               />
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setSelectedWord(null)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddVariant}>Add Variant</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </motion.div>
//     </ProtectedRoute>
//   );
// }

export default function CrimeDictionary() {
  return (
    <div>Crime Dictionary</div>
  );
}