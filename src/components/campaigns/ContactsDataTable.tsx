
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Check, X, Trash2 } from 'lucide-react';

interface Contact {
  phone_number: string;
  variables?: { [key: string]: string };
}

interface ContactsDataTableProps {
  contacts: Contact[];
  variables: string[];
  onContactsUpdate: (contacts: Contact[]) => void;
}

export const ContactsDataTable: React.FC<ContactsDataTableProps> = ({
  contacts,
  variables,
  onContactsUpdate
}) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Contact | null>(null);

  const handleEdit = (index: number) => {
    setEditingRow(index);
    setEditingData({ ...contacts[index] });
  };

  const handleSave = () => {
    if (editingRow !== null && editingData) {
      const updatedContacts = [...contacts];
      updatedContacts[editingRow] = editingData;
      onContactsUpdate(updatedContacts);
      setEditingRow(null);
      setEditingData(null);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditingData(null);
  };

  const handleDelete = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    onContactsUpdate(updatedContacts);
  };

  const handleFieldChange = (field: string, value: string) => {
    if (editingData) {
      if (field === 'phone_number') {
        setEditingData({ ...editingData, phone_number: value });
      } else {
        setEditingData({
          ...editingData,
          variables: { ...editingData.variables, [field]: value }
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts Data ({contacts.length} contacts)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                {variables.map((variable) => (
                  <TableHead key={variable}>
                    {variable} Value
                  </TableHead>
                ))}
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {editingRow === index ? (
                      <Input
                        value={editingData?.phone_number || ''}
                        onChange={(e) => handleFieldChange('phone_number', e.target.value)}
                        className="min-w-32"
                      />
                    ) : (
                      contact.phone_number
                    )}
                  </TableCell>
                  {variables.map((variable) => (
                    <TableCell key={variable}>
                      {editingRow === index ? (
                        <Input
                          value={editingData?.variables?.[variable] || ''}
                          onChange={(e) => handleFieldChange(variable, e.target.value)}
                          className="min-w-24"
                        />
                      ) : (
                        <span className="text-sm">
                          {contact.variables?.[variable] || '-'}
                        </span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex space-x-1">
                      {editingRow === index ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSave}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(index)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
