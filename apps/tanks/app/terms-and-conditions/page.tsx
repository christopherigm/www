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
