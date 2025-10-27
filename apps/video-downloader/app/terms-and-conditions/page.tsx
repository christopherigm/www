import React, { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Terms and conditions',
  };
};

type TextProps = {
  children?: ReactNode;
  bold?: boolean;
};

const Text = ({ children, bold = false }: TextProps): ReactNode => (
  <Typography marginTop={3} align="justify" fontWeight={bold ? 'bold' : ''}>
    {children}
  </Typography>
);

const Page = () => {
  return (
    <>
      <Typography marginTop={3} variant="h5">
        Terms and Conditions
      </Typography>
      <Text>
        By accessing this website we assume you accept these terms and
        conditions. Do not continue to use this site if you do not agree to take
        all of the terms and conditions stated on this page.
      </Text>
      <Text>
        The following terminology applies to these Terms and Conditions, Privacy
        Statement and Disclaimer Notice and all Agreements: &quot;Client&quot;,
        &quot;You&quot; and &quot;Your&quot; refers to you, the person log on
        this website and compliant to the Company&apos;s terms and conditions.
        &quot;The Company&quot;, &quot;Ourselves&quot;, &quot;We&quot;,
        &quot;Our&quot; and &quot;Us&quot;, refers to our Company.
        &quot;Party&quot;, &quot;Parties&quot;, or &quot;Us&quot;, refers to
        both the Client and ourselves. All terms refer to the offer, acceptance
        and consideration of payment necessary to undertake the process of our
        assistance to the Client in the most appropriate manner for the express
        purpose of meeting the Client&apos;s needs in respect of provision of
        the Company&apos;s stated services, in accordance with and subject to,
        prevailing law of in. Any use of the above terminology or other words in
        the singular, plural, capitalization and/or he/she or they, are taken as
        interchangeable and therefore as referring to same.
      </Text>
      <Text bold>License</Text>
      <Text>
        Unless otherwise stated, This Web App and/or its licensors own the
        intellectual property rights for all material on this site. All
        intellectual property rights are reserved. You may access this from this
        site for your own personal use subjected to restrictions set in these
        terms and conditions.
      </Text>
      <Text>You must not:</Text>
      <Text>
        Republish material from this site Sell, rent or sub-license material
        from this site Reproduce, duplicate or copy material from this site
        Redistribute content from this site Parts of this website offer an
        opportunity for users to post and exchange opinions and information in
        certain areas of the website. This Web App does not filter, edit,
        publish or review Comments prior to their presence on the website.
        Comments do not reflect the views and opinions of This Web App,its
        agents and/or affiliates. Comments reflect the views and opinions of the
        person who post their views and opinions. To the extent permitted by
        applicable laws, This Web App shall not be liable for the Comments or
        for any liability, damages or expenses caused and/or suffered as a
        result of any use of and/or posting of and/or appearance of the Comments
        on this website.
      </Text>
      <Text>
        This Web App reserves the right to monitor all Comments and to remove
        any Comments which can be considered inappropriate, offensive or causes
        breach of these Terms and Conditions.
      </Text>
      <Text>You warrant and represent that:</Text>
      <Text>
        You are entitled to post the Comments on our website and have all
        necessary licenses and consents to do so; The Comments do not invade any
        intellectual property right, including without limitation copyright,
        patent or trademark of any third party; The Comments do not contain any
        defamatory, libelous, offensive, indecent or otherwise unlawful material
        which is an invasion of privacy The Comments will not be used to solicit
        or promote business or custom or present commercial activities or
        unlawful activity. You hereby grant This Web App a non-exclusive license
        to use, reproduce, edit and authorize others to use, reproduce and edit
        any of your Comments in any and all forms, formats or media.
      </Text>
      <Text bold>
        1. User&apos;s Responsibility to Only Download Videos That Belong to
        Them
      </Text>
      <Text>
        Ownership Criteria: Users are responsible for downloading only videos
        that they legally own or have been granted rights to use by the content
        owner. This includes videos purchased through legal channels, such as
        purchasing a subscription, paying for individual downloads, or receiving
        permission from the content owner. Authentication Process : Users must
        verify ownership through a secure authentication process, which may
        include logging into their accounts with verified credentials and
        confirming that they have the right to access specific content.
        Consequences of Misuse : Unauthorized downloading, sharing, or
        distributing content not belonging to the user can lead to severe
        penalties, including account termination, legal action, fines, and
        potential civil liability beyond just account termination.
      </Text>
      <Text bold>
        2. User&apos;s Responsibility to Obtain Copyright Permissions Before
        Downloading Videos
      </Text>
      <Text>
        Permission Acquisition Process : Users must contact the content owner
        directly through provided means to request copyright permissions. This
        process may require submitting a written request with necessary
        documentation, such as proof of ownership or authorization from the
        content owner. Contact Information and Instructions : The platform
        provides clear instructions and contact information for contacting the
        content owner, including email addresses or support channels where users
        can initiate permission requests. Verification of Permission : Before
        downloading, users must obtain written confirmation of copyright
        permissions. Without this documentation, any download or use of the
        content may be considered unauthorized.
      </Text>
      <Text bold>
        3. User Assumes All Responsibility for the Use of the Tool
      </Text>
      <Text>
        Misuse Examples : Misuse includes downloading content for commercial
        purposes without authorization, altering videos, and using them in ways
        that infringe on others&apos; rights. Examples include sharing content
        for profit or redistributing it without proper permissions.
        Company&apos;s Support and Assistance : The company provides tools and
        resources to assist users in using the service lawfully. Users are
        encouraged to contact support with any questions about compliance or
        appropriate use. Liability Limitations : While the company is not liable
        for indirect or third-party damages resulting from misuse, it offers
        support within reasonable limits to help users navigate lawful content
        use.
      </Text>
      <Text bold>4. Compliance with DMCA and 17 U.S.C. §512</Text>
      <Text>
        Content Filtering Measures : The app employs content filtering
        algorithms to monitor and prevent unauthorized distribution of protected
        content. Users are expected to adhere to these measures as part of their
        agreement. Reporting Infringement : The platform encourages users to
        report infringing content promptly. Rights holders receive timely
        notifications, and offending content is often removed within specified
        parameters. Cooperation with Rights Holders : The company cooperates
        with content owners to address unauthorized use promptly, ensuring that
        rights are protected and enforced effectively.
      </Text>
      <Text bold>Conclusion</Text>
      <Text>
        By adhering to these responsibilities and compliance measures, users
        contribute to a secure and respectful environment for content sharing.
        Misuse is met with serious consequences, emphasizing the importance of
        lawful and ethical use of the service.
      </Text>
    </>
  );
};

export default Page;
