// api/remote-config/update/update.ts
import { NextResponse } from 'next/server';
import { adminRemoteConfig } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    console.log('Updating Remote Config template...');
    try {
      const body = await request.json();
      const { parameters } = body;
      
      if (!parameters || typeof parameters !== 'object') {
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
        );
      }
      
      // Get the current template
      const template = await adminRemoteConfig.getTemplate();
      
      // Update the template with new parameter values
      Object.keys(parameters).forEach(key => {
        const paramValue = String(parameters[key]);
        
        if (template.parameters[key]) {
          template.parameters[key].defaultValue = {
            value: paramValue
          };
        } else {
          template.parameters[key] = {
            defaultValue: {
              value: paramValue
            }
          };
        }
      });
      
      // Validate and publish the updated template
      await adminRemoteConfig.validateTemplate(template);
      await adminRemoteConfig.publishTemplate(template);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Remote Config updated successfully' 
      });
    } catch (error) {
      console.error('Error updating Remote Config template:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update Remote Config',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  }