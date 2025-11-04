
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CharacterBuild {
  id: string;
  name: string;
  class: string;
  baseLevel: number;
  jobLevel: number;
  stats: {
    str: number;
    agi: number;
    vit: number;
    int: number;
    dex: number;
    luk: number;
  };
  createdAt: number;
}

export default function CharacterBuilderPage() {
  const [builds, setBuilds] = useState<CharacterBuild[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingBuild, setEditingBuild] = useState<CharacterBuild | null>(null);

  // Form state
  const [buildName, setBuildName] = useState('');
  const [buildClass, setBuildClass] = useState('knight');
  const [baseLevel, setBaseLevel] = useState(99);
  const [jobLevel, setJobLevel] = useState(50);
  const [stats, setStats] = useState({
    str: 1,
    agi: 1,
    vit: 1,
    int: 1,
    dex: 1,
    luk: 1
  });

  const classes = [
    'Knight', 'Wizard', 'Hunter', 'Priest', 'Assassin', 'Blacksmith',
    'Crusader', 'Sage', 'Bard', 'Dancer', 'Monk', 'Alchemist',
    'Rogue', 'Soul Linker', 'Gunslinger', 'Ninja', 'Star Gladiator'
  ];

  const totalStats = Object.values(stats).reduce((a, b) => a + b, 0);
  const maxStats = baseLevel + jobLevel - 2;

  const handleSaveBuild = () => {
    if (!buildName.trim()) {
      alert('Please enter a build name');
      return;
    }

    const newBuild: CharacterBuild = {
      id: Date.now().toString(),
      name: buildName,
      class: buildClass,
      baseLevel,
      jobLevel,
      stats: { ...stats },
      createdAt: Date.now()
    };

    if (editingBuild) {
      setBuilds(builds.map(b => b.id === editingBuild.id ? { ...newBuild, id: editingBuild.id } : b));
    } else {
      setBuilds([...builds, newBuild]);
    }

    resetForm();
  };

  const resetForm = () => {
    setBuildName('');
    setBuildClass('knight');
    setBaseLevel(99);
    setJobLevel(50);
    setStats({ str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 });
    setShowBuilder(false);
    setEditingBuild(null);
  };

  const handleEditBuild = (build: CharacterBuild) => {
    setEditingBuild(build);
    setBuildName(build.name);
    setBuildClass(build.class);
    setBaseLevel(build.baseLevel);
    setJobLevel(build.jobLevel);
    setStats(build.stats);
    setShowBuilder(true);
  };

  const handleDeleteBuild = (id: string) => {
    if (confirm('Are you sure you want to delete this build?')) {
      setBuilds(builds.filter(b => b.id !== id));
    }
  };

  const handleExportBuild = (build: CharacterBuild) => {
    const dataStr = JSON.stringify(build, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${build.name.replace(/\s+/g, '_')}_build.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBuild = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target?.result as string) as CharacterBuild;
            imported.id = Date.now().toString();
            imported.createdAt = Date.now();
            setBuilds([...builds, imported]);
            alert(`Build "${imported.name}" imported successfully!`);
          } catch (error) {
            alert('Error importing build. Please check the file.');
            console.error('Import error:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (showBuilder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
          <div className="container mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">
                  {editingBuild ? 'Edit Build' : 'New Build'}
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-4xl px-4 py-8">
          <Card className="p-8 bg-white">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="buildName">Build Name</Label>
                  <Input
                    id="buildName"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    placeholder="My Epic Build"
                  />
                </div>
                <div>
                  <Label htmlFor="buildClass">Class</Label>
                  <Select value={buildClass} onValueChange={setBuildClass}>
                    <SelectTrigger id="buildClass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls.toLowerCase()}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Levels */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="baseLevel">Base Level: {baseLevel}</Label>
                  <input
                    id="baseLevel"
                    type="range"
                    min="1"
                    max="200"
                    value={baseLevel}
                    onChange={(e) => setBaseLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="jobLevel">Job Level: {jobLevel}</Label>
                  <input
                    id="jobLevel"
                    type="range"
                    min="1"
                    max="70"
                    value={jobLevel}
                    onChange={(e) => setJobLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Stats ({totalStats} / {maxStats} points used)
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(stats).map(([stat, value]) => (
                    <div key={stat}>
                      <Label htmlFor={stat} className="capitalize">
                        <span className={`font-bold ${
                          stat === 'str' ? 'text-red-600' :
                          stat === 'agi' ? 'text-green-600' :
                          stat === 'vit' ? 'text-orange-600' :
                          stat === 'int' ? 'text-blue-600' :
                          stat === 'dex' ? 'text-yellow-600' :
                          'text-pink-600'
                        }`}>
                          {stat.toUpperCase()}
                        </span>
                        : {value}
                      </Label>
                      <input
                        id={stat}
                        type="range"
                        min="1"
                        max="120"
                        value={value}
                        onChange={(e) => setStats({...stats, [stat]: Number(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button onClick={handleSaveBuild} className="flex-1">
                  Save Build
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-slate-900">Character Builder</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleImportBuild} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowBuilder(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Build
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Card className="p-6 mb-8 bg-white text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Manage Your Character Builds
          </h2>
          <p className="text-slate-600">
            Create and save multiple character builds with stats and equipment
          </p>
        </Card>

        {builds.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Users className="h-16 w-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No builds yet</h3>
            <p className="text-slate-600 mb-6">Create your first character build to get started</p>
            <Button onClick={() => setShowBuilder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Build
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((build) => (
              <Card
                key={build.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200"
                onClick={() => handleEditBuild(build)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{build.name}</h3>
                    <p className="text-purple-600 text-sm capitalize">{build.class}</p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExportBuild(build)}
                      title="Export build"
                    >
                      <Download className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBuild(build.id)}
                      title="Delete build"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Level</span>
                    <span className="font-mono font-bold">{build.baseLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Job Level</span>
                    <span className="font-mono font-bold">{build.jobLevel}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-red-600 font-bold">STR</span>
                      <span className="ml-1">{build.stats.str}</span>
                    </div>
                    <div>
                      <span className="text-green-600 font-bold">AGI</span>
                      <span className="ml-1">{build.stats.agi}</span>
                    </div>
                    <div>
                      <span className="text-orange-600 font-bold">VIT</span>
                      <span className="ml-1">{build.stats.vit}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-bold">INT</span>
                      <span className="ml-1">{build.stats.int}</span>
                    </div>
                    <div>
                      <span className="text-yellow-600 font-bold">DEX</span>
                      <span className="ml-1">{build.stats.dex}</span>
                    </div>
                    <div>
                      <span className="text-pink-600 font-bold">LUK</span>
                      <span className="ml-1">{build.stats.luk}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
