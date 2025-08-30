import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { FileUpload } from "../../components/ui/file-upload";
import { Plus, Users, Edit, Trash2, Camera } from "lucide-react";
import { databaseHelpers, type Deceased } from "../../lib/database";

export default function DeceasedPage() {
  const [deceased, setDeceased] = useState<Deceased[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male" as "male" | "female",
    deathDate: "",
    burialDate: "",
    representativeName: "",
    representativePhone: "",
    status: "pending" as "pending" | "completed",
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  useEffect(() => {
    loadDeceased();
  }, []);

  const loadDeceased = async () => {
    try {
      const data = await databaseHelpers.getAllDeceased();
      setDeceased(data);
    } catch (error) {
      console.error('Failed to load deceased records:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert photo to base64 if selected
      let photoData: string | undefined = undefined;
      if (selectedPhoto) {
        photoData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedPhoto);
        });
      }

      if (editingId) {
        // Update existing record
        await databaseHelpers.updateDeceased(editingId, {
          ...formData,
          age: parseInt(formData.age),
          photo: photoData,
        });
      } else {
        // Add new record
        await databaseHelpers.addDeceased({
          ...formData,
          age: parseInt(formData.age),
          photo: photoData,
        });
      }
      
      setFormData({
        name: "",
        age: "",
        gender: "male",
        deathDate: "",
        burialDate: "",
        representativeName: "",
        representativePhone: "",
        status: "pending",
      });
      setFormData({
        name: "",
        age: "",
        gender: "male",
        deathDate: "",
        burialDate: "",
        representativeName: "",
        representativePhone: "",
        status: "pending",
      });
      setSelectedPhoto(null);
      setEditingId(null);
      setShowForm(false);
      loadDeceased();
    } catch (error) {
      console.error('Failed to add deceased record:', error);
      alert('Failed to add record. Please try again.');
    }
  };

  const handleEdit = (record: Deceased) => {
    setEditingId(record.id || null);
    setFormData({
      name: record.name,
      age: record.age.toString(),
      gender: record.gender,
      deathDate: record.deathDate,
      burialDate: record.burialDate,
      representativeName: record.representativeName,
      representativePhone: record.representativePhone,
      status: record.status,
    });
    setSelectedPhoto(null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await databaseHelpers.deleteDeceased(id);
        loadDeceased();
      } catch (error) {
        console.error('Failed to delete deceased record:', error);
        alert('Failed to delete record. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      age: "",
      gender: "male",
      deathDate: "",
      burialDate: "",
      representativeName: "",
      representativePhone: "",
      status: "pending",
    });
    setSelectedPhoto(null);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deceased Records</h1>
          <p className="text-muted-foreground">
            Manage funeral records and deceased information
          </p>
        </div>
        <Button onClick={() => showForm ? handleCancel() : setShowForm(true)}>
          {showForm ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Deceased Record' : 'Add New Deceased Record'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update the details of the deceased person' : 'Enter the details of the deceased person'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "pending" | "completed" })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="deathDate">Date of Death</Label>
                  <Input
                    id="deathDate"
                    type="date"
                    value={formData.deathDate}
                    onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="burialDate">Burial Date</Label>
                  <Input
                    id="burialDate"
                    type="date"
                    value={formData.burialDate}
                    onChange={(e) => setFormData({ ...formData, burialDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="representativeName">Representative Name</Label>
                  <Input
                    id="representativeName"
                    value={formData.representativeName}
                    onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="representativePhone">Representative Phone</Label>
                  <Input
                    id="representativePhone"
                    value={formData.representativePhone}
                    onChange={(e) => setFormData({ ...formData, representativePhone: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              {/* Photo Upload */}
              <div>
                <Label htmlFor="photo">Photo (Optional)</Label>
                <FileUpload
                  onFileSelect={setSelectedPhoto}
                  acceptedTypes={["image/*"]}
                  maxSize={5}
                  placeholder="Upload a photo of the deceased person"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Update Record' : 'Save Record'}</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
          <CardDescription>
            {deceased.length} deceased records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deceased.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <p>No deceased records found</p>
              <p className="text-sm">Add your first record to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Photo</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Age</th>
                    <th className="text-left p-2">Gender</th>
                    <th className="text-left p-2">Death Date</th>
                    <th className="text-left p-2">Burial Date</th>
                    <th className="text-left p-2">Representative</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deceased.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {record.photo ? (
                          <img
                            src={record.photo}
                            alt={record.name}
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Camera className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="p-2 font-medium">{record.name}</td>
                      <td className="p-2">{record.age}</td>
                      <td className="p-2 capitalize">{record.gender}</td>
                      <td className="p-2">{new Date(record.deathDate).toLocaleDateString()}</td>
                      <td className="p-2">{new Date(record.burialDate).toLocaleDateString()}</td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{record.representativeName}</div>
                          <div className="text-sm text-muted-foreground">{record.representativePhone}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(record.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
